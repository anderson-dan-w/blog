import { useEffect, useMemo, useRef, useState } from "react";
import scrollama from "scrollama";
import { drawablesToStrokePath, generator } from "../lib/rough";
import { HandDrawnBox } from "./HandDrawnBox";
import { Prose } from "./Prose";

// Self-contained scrollytelling for the AWS-Org post. Step content is keyed
// off the active step index; the diagram's elements fade in once the reader
// hits their `from` step and stay visible thereafter.

type Step = {
  id: string;
  shortTitle: string;
  title: string;
  prose: string;
  /** Optional code/snippet content rendered in the bottom-left "extras"
   *  quadrant of the sticky panel. Hidden on mobile (rendered inline within
   *  the step instead). */
  extras?: string;
};

const STEPS: Step[] = [
  {
    id: "empty",
    title: "Day 0 — one account, one root user",
    shortTitle: "Day 0",
    prose: `After signing up at \`aws.amazon.com\`, you get a single account, owned by the \`root user\`.
 That root user can do anything - including delete itself and all the resources.

 The only things the \`root user\` should do:
 - Require MFA
 - Create some other admin users, ideally SSO
 - Get locked away as a backup for billing emergencies and account closure

 What we don't want to do is make long-lived access keys for the root user.

 So, how can we build out a centrally-managed org with safe permissions,
 and isolation among the accounts?
 `,
  },
  {
    id: "org",
    title: "Step 1 — AWS Organization and root account",
    shortTitle: "Org",
    prose: `From the \`AWS Organizations\` service page, create a new Organization.
  This turns the original account into the *management* or *root account* for the entire org.
  This \`root account\` is the only one that can create new AWS accounts.

  But even with that power, we wouldn't want to give a developer full admin access to the entire org if they're just creating a new account.

  So let's start locking it down.
  `,
  },
  {
    id: "sso",
    title: "SSO and \`break-glass-user\` user",
    shortTitle: "SSO",
    prose: `We'll use AWS IAM Identity Center (SSO) to manage our users.

  From the \`AWS IAM Identity Center\` service page, click **Enable** to create a new Identity Center instance.

  Once that's enabled:

  - Create a new User: \`break-glass-user\` (either your email or like \`break-glass@your-domain.com\`)
  - Create a new Permission Set: \`AdministratorAccess\` - it's a pre-defined
  policy, and the \`Permission Set\` itself can be named \`AdministratorAccess\`
  for convenience.

On their own, neither of these is particularly useful, because the user doesn't have permission in any specific account.
So we need to assign a 3-tuple of \`(account, user-or-group, permission set)\`.

  - From \`Identity Center → AWS Accounts\`, create a new Account Assignment: \`(root, break-glass-user, AdministratorAccess)\`.

  Now, we're done with the \`root user\`, and can migrate to using \`terraform\` to manage from here on out.

  `,
  },
  {
    id: "org-mgmt",
    title: "Step 3 — \`org-mgmt\` group and permission set",
    shortTitle: "OrgMgmt",
    prose: `
  From the CLI, sso-login as \`break-glass-user\` and run \`terraform init\` in \`terraform/aws/org/\`.

  Declare the \`org-mgmt\` group and permission set in \`main.tf\`.
  This will be the account used for creating new accounts, adding new users, etc.

  The crucial part is that we restrict what \`org-mgmt\` can do, which is ONLY those basic org-level operations
  - it can't create resources like EC2 or EKS
  - it can't modify billing
  - it can't close the org

  Run \`terraform apply\` to create the \`org-mgmt\` group and permission set.

  Now, we can be done with the \`break-glass-user\` user, and use \`org-mgmt\` for everything else.
  `,
    extras: `\`\`\`hcl
# terraform/aws/org/main.tf
resource "aws_identitystore_group" "org_mgmt" {
  display_name      = "org-mgmt"
}
# add "me" user to "org-mgmt" group

resource "aws_ssoadmin_permission_set" "org_mgmt" {
  name         = "OrgManagement"
}
# add managed and inline policy attachments

resource "aws_ssoadmin_account_assignment" "org_mgmt" {
  permission_set_arn = aws_ssoadmin_permission_set.org_mgmt.arn
  principal_id       = aws_identitystore_group.org_mgmt.group_id
  target_id          = aws_organizations_account.root.id
}
\`\`\``,
  },
  {
    id: "terraform-account",
    shortTitle: "Terraform Account",
    title: "Step 4 — dedicated terraform account",
    prose: `
Now, making a new AWS account is simple:
- declare the account (\`aws_organizations_account\`)
- add account assignments (\`aws_ssoadmin_account_assignment\`)

Start with a new account called \`terraform\` (or \`infra-state\` or whatever you want),
and give the \`org-mgmt\` group \`admin\` access to it,
so they can create the S3 bucket that holds the state.
`,
    extras: `\`\`\`hcl
# terraform/aws/org/main.tf
resource "aws_organizations_account" "terraform" {
  name = "terraform"
  email = "aws-terraform@your-domain.com"
}

resource "aws_ssoadmin_account_assignment" "terraform_org_mgmt_admin" {
  permission_set_arn = aws_ssoadmin_permission_set.admin.arn
  principal_id       = aws_identitystore_group.org_mgmt.group_id
  target_id          = aws_organizations_account.terraform.id
}
\`\`\`
`,
  },
  {
    id: "s3-bucket",
    shortTitle: "TF State S3 Bucket",
    title: "Step 5 — S3 bucket for state",
    prose: `
Now, switch to the \`terraform\` directory (make it if needed) and we'll make
the S3 bucket that will hold all the state files for all our terraforming - each AWS account gets its own folder,
and even other cloud resources (like GCP or Azure) can have their own state files here too.
This way, we have a single source of truth for all our terraforming state.

We need to make:
- the \`S3 bucket\` (and all its fields like versioning, ownership controls, and ACL)
- a very narrow \`IAM policy\` that everyone will use when terraforming other accounts.

That way, when an engineer terraforms something in another account, they'll be able to update the state here,
but not do anything else, accidentally or otherwise.
`,
    extras: `\`\`\`hcl
# terraform/aws/terraform/main.tf
resource "aws_s3_bucket" "terraform_state" {
  bucket = "your-domain-tfstate"
  lifecycle { prevent_destroy = true }
}

resource "aws_iam_policy" "terraform_state_access" {
  name        = "TerraformStateAccess"
  description = "Read/write Terraform state."
  policy = jsonencode({
    # ListBucket,
    # GetObject, PutObject, DeleteObject
  })
}
\`\`\``,
  },
  {
    id: "migrate-state",
    shortTitle: "Push state to S3",
    title: "Step 6 — push local state to S3 (both workspaces)",
    prose: `In each workspace (\`terraform/aws/terraform/\` and \`terraform/aws/org/\`):

- Add a \`backend "s3" {}\` block.
- \`terraform init -migrate-state\`. Terraform notices the new backend, prompts to copy local state up. Confirm.

Same backend profile (\`tf-org-mgmt\`), same bucket, different \`key\` per workspace. Two state files now live in the bucket: \`org\` and \`terraform\`.`,
    extras: `\`\`\`hcl
# terraform/aws/{terraform,org}/backend.tf
terraform {
  backend "s3" {
    bucket       = "your-domain-tfstate"
    key          = "terraform"  # or "org"
    profile      = "tf-org-mgmt"
    region       = "us-east-1"
    use_lockfile = true
    encrypt      = true
  }
}
\`\`\``,
  },
  {
    id: "tsa-permset",
    shortTitle: "TfStateAccess PS",
    title: "Step 7 — \`TerraformStateAccess\` IDC permset",
    prose: `Back in \`terraform/aws/org/\`. The IAM policy in the \`terraform\` account (from step 5) isn't usable by humans until it's wrapped in an IDC permission set and assigned to a group.

- Declare an \`engineering\` IdentityStore group and add \`me\` to it.
- Declare the \`TerraformStateAccess\` IDC permission set with a \`customer_managed_policy_reference\` pointing at the IAM policy by name. IDC resolves the name in the target account at SSO-login time — which is why the IAM policy had to be created in the \`terraform\` account first.
- Account assignment: \`(engineering, TerraformStateAccess, terraform)\`.
- \`terraform apply\`.

Anyone in \`engineering\` can now SSO-login picking \`TerraformStateAccess\` on the \`terraform\` account. That role has exactly 4 S3 actions on the state bucket, nothing else.`,
    extras: `\`\`\`hcl
# terraform/aws/org/engineering.tf
resource "aws_identitystore_group" "engineering" {
  display_name = "engineering"
}
# add "me" to engineering

resource "aws_ssoadmin_permission_set" "terraform_state_access" {
  name = "TerraformStateAccess"
}

resource "aws_ssoadmin_customer_managed_policy_attachment" "tsa" {
  permission_set_arn = aws_ssoadmin_permission_set.terraform_state_access.arn
  customer_managed_policy_reference {
    name = "TerraformStateAccess"  # resolved in target account at login
    path = "/"
  }
}

resource "aws_ssoadmin_account_assignment" "eng_tsa" {
  permission_set_arn = aws_ssoadmin_permission_set.terraform_state_access.arn
  principal_id       = aws_identitystore_group.engineering.group_id
  target_id          = aws_organizations_account.terraform.id
}
\`\`\``,
  },
  {
    id: "app-ou",
    shortTitle: "app OU",
    title: "Step 8 — first workload OU and accounts",
    prose: `Back in \`terraform/aws/org/\`, declare the first real workload OU and a couple of accounts under it.

- \`app\` OU under the org root.
- \`app-dev\` and \`app-prod\` accounts under it.
- Account assignments: \`(engineering, AdministratorAccess, app-dev)\` and the same for \`app-prod\`.

AWS auto-creates \`OrganizationAccountAccessRole\` in each new account — an IAM role trusting management, used as a cross-account break-glass door if SSO bindings break.`,
    extras: `\`\`\`hcl
# terraform/aws/org/app.tf
resource "aws_organizations_organizational_unit" "app" {
  name      = "app"
  parent_id = aws_organizations_organization.org.roots[0].id
}

resource "aws_organizations_account" "app_dev" {
  name      = "app-dev"
  email     = "aws+app-dev@your-domain.com"
  parent_id = aws_organizations_organizational_unit.app.id
  lifecycle { ignore_changes = [name, email, role_name] }
}
# same for app_prod

resource "aws_ssoadmin_account_assignment" "eng_admin_app_dev" {
  permission_set_arn = aws_ssoadmin_permission_set.administrator.arn
  principal_id       = aws_identitystore_group.engineering.group_id
  target_id          = aws_organizations_account.app_dev.id
}
# same for app_prod
\`\`\``,
  },
  {
    id: "app-dev-workspace",
    shortTitle: "Dual profile",
    title: "Step 9 — \`app/dev/\` workspace: two files, two profiles",
    prose: `New workspace at \`terraform/aws/app/dev/\`. Two files pin AWS credentials, deliberately to *different* profiles:

- \`backend.tf\` → \`profile = "terraform"\` (TerraformStateAccess on the terraform account). Reads/writes state. That's it.
- \`main.tf\` provider → \`profile = "app-dev"\` (AdministratorAccess on the app-dev account). Creates real resources. Can't touch state.

Both profiles get used in a single \`terraform apply\` here — but they never share a permission. The credential writing state can't create an EKS cluster. The credential creating the EKS cluster can't touch state.`,
    extras: `\`\`\`hcl
# terraform/aws/app/dev/backend.tf
terraform {
  backend "s3" {
    bucket       = "your-domain-tfstate"
    key          = "app-dev"
    profile      = "terraform"   # state RW only
    region       = "us-east-1"
    use_lockfile = true
    encrypt      = true
  }
}
\`\`\`

\`\`\`hcl
# terraform/aws/app/dev/main.tf
provider "aws" {
  profile = "app-dev"   # admin in app-dev only
  region  = "us-east-1"
}
\`\`\``,
  },
];

export function AwsOrgScrolly() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scroller = scrollama();
    scroller
      .setup({ step: ".scrolly-step", offset: 0.5 })
      .onStepEnter((resp) => setActiveIndex(resp.index));

    const onResize = () => scroller.resize();
    const onScroll = () => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      const scrolled = Math.max(0, -rect.top);
      setProgress(total > 0 ? Math.min(1, scrolled / total) : 0);
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      scroller.destroy();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const active = STEPS[activeIndex] ?? STEPS[0];

  return (
    <div ref={containerRef} className="scrolly-container">
      <div className="scrolly-progressbar" aria-hidden="true">
        <div
          className="scrolly-progress-fill"
          style={{ transform: `scaleX(${progress})` }}
        />
        <ol className="scrolly-progress-dots">
          {STEPS.map((step, i) => (
            <li
              key={step.id}
              data-active={i === activeIndex ? "true" : "false"}
            >
              <span className="label">{step.shortTitle}</span>
              <span className="dot" />
            </li>
          ))}
        </ol>
      </div>

      <div className="scrolly-diagram">
        <div className="diagram-zone">
          <div className="scrolly-diagram-inner">
            <OrgDiagram stepIndex={activeIndex} />
          </div>
        </div>
        <div className="extras-zone" aria-hidden={!active.extras}>
          {active.extras ? (
            <div className="extras-inner">
              <Prose text={active.extras} />
            </div>
          ) : null}
        </div>
      </div>

      <div className="scrolly-steps">
        {STEPS.map((step, i) => (
          <section
            key={step.id}
            className="scrolly-step"
            data-scene-id={step.id}
            data-active={i === activeIndex ? "true" : "false"}
          >
            <h2>{step.title}</h2>
            <Prose text={step.prose} />
            {step.extras ? (
              <div className="extras-inline">
                <Prose text={step.extras} />
              </div>
            ) : null}
          </section>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Inline SVG, hand-drawn via roughjs. Each element below has a `from` step —
// it fades in once the reader hits that step and stays visible thereafter.
// Layout:
//   y=20-420   : org boundary (dashed)
//     y=50-170 : management account (left) | terraform account (right)
//     y=200-400: OUs row (app on left, sandbox on right)
//   y=440-490 : (intentionally empty — extras zone owns the bottom area)
// ---------------------------------------------------------------------------

function HandDrawnDashedBox({
  x,
  y,
  width,
  height,
  seed = 1,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  seed?: number;
}) {
  const d = useMemo(
    () =>
      drawablesToStrokePath([
        generator.rectangle(x, y, width, height, {
          seed,
          roughness: 1.1,
          strokeLineDash: [10, 5],
        }),
      ]),
    [x, y, width, height, seed],
  );
  return (
    <path
      d={d}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

function HandDrawnFilledBox({
  x,
  y,
  width,
  height,
  seed = 1,
  fill = "rgba(127,127,127,0.06)",
  strokeWidth = 1.5,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  seed?: number;
  fill?: string;
  strokeWidth?: number;
}) {
  return (
    <>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={4}
        fill={fill}
        stroke="none"
      />
      <HandDrawnBox
        x={x}
        y={y}
        width={width}
        height={height}
        seed={seed}
        strokeWidth={strokeWidth}
      />
    </>
  );
}

function HandDrawnAccentPill({
  x,
  y,
  width,
  height,
  seed = 1,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  seed?: number;
}) {
  const d = useMemo(
    () =>
      drawablesToStrokePath([
        generator.rectangle(x, y, width, height, { seed, roughness: 0.8 }),
      ]),
    [x, y, width, height, seed],
  );
  return (
    <>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={height / 2}
        fill="rgba(100,100,241,0.13)"
        stroke="none"
      />
      <path
        d={d}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={1.1}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  );
}

type DiffState = "hidden" | "new" | "label-changed" | "unchanged";

/** Per-step diff state for a diagram element. Mirrors the mechanic from the
 *  db-migration scrolly: each <g> wraps a shape + its labels, the wrapper
 *  carries data-diff-state, and global.css paints the accent stroke + accent
 *  text fill + pulse animation. */
function diffState(
  stepIndex: number,
  introducedAt: number,
  labelChangedAt?: number,
): DiffState {
  if (stepIndex < introducedAt) return "hidden";
  if (stepIndex === introducedAt) return "new";
  if (labelChangedAt !== undefined && stepIndex === labelChangedAt) return "label-changed";
  return "unchanged";
}

/** A 130×50 box representing one IDC account assignment:
 *  (account, permission set, principal). Reused for all five assignments. */
function AssignBox({
  x,
  y,
  account,
  permset,
  principal,
  introducedAt,
  stepIndex,
  seed,
}: {
  x: number;
  y: number;
  account: string;
  permset: string;
  principal: string;
  introducedAt: number;
  stepIndex: number;
  seed: number;
}) {
  return (
    <g className="diagram-element" data-diff-state={diffState(stepIndex, introducedAt)}>
      <g className="diagram-node">
        <HandDrawnBox
          x={x}
          y={y}
          width={130}
          height={50}
          seed={seed}
          strokeWidth={1.0}
        />
      </g>
      <text
        x={x + 8}
        y={y + 17}
        fontSize={9}
        fill="currentColor"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {account}
      </text>
      <text
        x={x + 8}
        y={y + 30}
        fontSize={9}
        fill="currentColor"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {permset}
      </text>
      <text
        x={x + 8}
        y={y + 43}
        fontSize={9}
        fill="currentColor"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {principal}
      </text>
    </g>
  );
}

function OrgDiagram({ stepIndex }: { stepIndex: number }) {
  const ds = (introducedAt: number, labelChangedAt?: number) =>
    diffState(stepIndex, introducedAt, labelChangedAt);

  return (
    <svg
      viewBox="0 0 540 460"
      className="diagram-svg"
      role="img"
      aria-label="AWS Organization, scene by scene"
    >
      {/* Org dashed boundary — appears at step 1. */}
      <g className="diagram-element" data-diff-state={ds(1)}>
        <g className="diagram-node">
          <HandDrawnDashedBox x={10} y={20} width={520} height={400} seed={41} />
        </g>
        <text
          x={24}
          y={38}
          fontSize={12}
          fill="currentColor"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          AWS Organization
        </text>
      </g>

      {/* Root/management account — present from Day 0; relabels at step 1
          ("basic account" → "Management account"). Spans the org top-to-mid
          so Identity Center can host its assignment grid inside. */}
      <g className="diagram-element" data-diff-state={ds(0, 1)}>
        <g className="diagram-node">
          <HandDrawnFilledBox
            x={30}
            y={50}
            width={480}
            height={190}
            seed={11}
          />
        </g>
        <text
          x={42}
          y={68}
          fontSize={12}
          fill="currentColor"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          {stepIndex === 0 ? "basic account" : "root account"}
        </text>
      </g>

      {/* Root user line — present from Day 0 (it's the only user in the
          basic account). */}
      <g className="diagram-element" data-diff-state={ds(0)}>
        <text
          x={42}
          y={82}
          fontSize={9}
          fill="currentColor"
          opacity={0.7}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          root user
        </text>
      </g>

      {/* IAM Identity Center — sub-box inside the management account, step 2.
          Holds the five account-assignment boxes added across steps 2/3/7/8. */}
      <g className="diagram-element" data-diff-state={ds(2)}>
        <g className="diagram-node">
          <HandDrawnBox
            x={46}
            y={88}
            width={448}
            height={148}
            seed={17}
            strokeWidth={1.1}
          />
        </g>
        <text
          x={54}
          y={102}
          fontSize={10}
          fill="currentColor"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          IAM Identity Center
        </text>
      </g>

      {/* Six IDC account assignments. Row 1 = bootstrap/setup (steps 2/3/4),
          row 2 = ongoing workload access (steps 7/8/8). */}
      <AssignBox
        x={67}
        y={108}
        account="root account"
        permset="Admin perms"
        principal="break-glass user"
        introducedAt={2}
        stepIndex={stepIndex}
        seed={51}
      />
      <AssignBox
        x={205}
        y={108}
        account="root account"
        permset="Org Mgmt perms"
        principal="org-mgmt group"
        introducedAt={3}
        stepIndex={stepIndex}
        seed={53}
      />
      <AssignBox
        x={343}
        y={108}
        account="terraform account"
        permset="Admin perms"
        principal="org-mgmt group"
        introducedAt={4}
        stepIndex={stepIndex}
        seed={54}
      />
      <AssignBox
        x={67}
        y={172}
        account="terraform account"
        permset="TFState perms"
        principal="engineering group"
        introducedAt={7}
        stepIndex={stepIndex}
        seed={55}
      />
      <AssignBox
        x={205}
        y={172}
        account="app-dev account"
        permset="Admin perms"
        principal="engineering group"
        introducedAt={8}
        stepIndex={stepIndex}
        seed={57}
      />
      <AssignBox
        x={343}
        y={172}
        account="app-prod account"
        permset="Admin perms"
        principal="engineering group"
        introducedAt={8}
        stepIndex={stepIndex}
        seed={59}
      />

      {/* terraform account — separate AWS account, sits below mgmt at step 4.
          Bucket and IAM policy show up at step 5 inside it. */}
      <g className="diagram-element" data-diff-state={ds(4)}>
        <g className="diagram-node">
          <HandDrawnFilledBox
            x={30}
            y={260}
            width={230}
            height={130}
            seed={29}
          />
        </g>
        <text
          x={42}
          y={278}
          fontSize={11}
          fill="currentColor"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          terraform account
        </text>
      </g>

      {/* S3 bucket inside the terraform account — step 5. */}
      <g className="diagram-element" data-diff-state={ds(5)}>
        <g className="diagram-node">
          <HandDrawnBox
            x={42}
            y={290}
            width={100}
            height={92}
            seed={31}
            strokeWidth={1.1}
          />
        </g>
        <text
          x={50}
          y={304}
          fontSize={10}
          fill="currentColor"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          S3 bucket
        </text>
        <text
          x={50}
          y={316}
          fontSize={8}
          fill="currentColor"
          opacity={0.7}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          your-domain-tfstate
        </text>
      </g>

      {/* State keys — appear inside the bucket once states are pushed up,
          step 6. Two keys, one per workspace. */}
      <g className="diagram-element" data-diff-state={ds(6)}>
        <text
          x={54}
          y={345}
          fontSize={8}
          fill="currentColor"
          fontFamily="ui-monospace, SFMono-Regular, monospace"
        >
          ├ org/
        </text>
        <text
          x={54}
          y={358}
          fontSize={8}
          fill="currentColor"
          fontFamily="ui-monospace, SFMono-Regular, monospace"
        >
          └ terraform/
        </text>
      </g>

      {/* IAM Policy alongside the bucket, step 5. */}
      <g className="diagram-element" data-diff-state={ds(5)}>
        <g className="diagram-node">
          <HandDrawnBox
            x={148}
            y={290}
            width={108}
            height={42}
            seed={37}
            strokeWidth={1.1}
          />
        </g>
        <text
          x={156}
          y={304}
          fontSize={10}
          fill="currentColor"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          IAM Policy
        </text>
        <text
          x={156}
          y={316}
          fontSize={8}
          fill="currentColor"
          opacity={0.7}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          TFState
        </text>
      </g>

      {/* OU: app — bottom-right, alongside the terraform account. Step 8.
          Both child accounts are introduced together with the OU. */}
      <g className="diagram-element" data-diff-state={ds(8)}>
        <g className="diagram-node">
          <HandDrawnBox
            x={280}
            y={260}
            width={230}
            height={130}
            seed={43}
            strokeWidth={1.3}
          />
        </g>
        <text
          x={292}
          y={278}
          fontSize={11}
          fill="currentColor"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          OU: app
        </text>

        <g className="diagram-node">
          <HandDrawnFilledBox
            x={290}
            y={290}
            width={212}
            height={42}
            seed={61}
            strokeWidth={1.1}
          />
        </g>
        <text
          x={298}
          y={304}
          fontSize={10}
          fill="currentColor"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          app-dev
        </text>
        <text
          x={298}
          y={316}
          fontSize={8}
          fill="currentColor"
          opacity={0.7}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          aws+app-dev@your-domain.com
        </text>

        <g className="diagram-node">
          <HandDrawnFilledBox
            x={290}
            y={338}
            width={212}
            height={42}
            seed={71}
            strokeWidth={1.1}
          />
        </g>
        <text
          x={298}
          y={352}
          fontSize={10}
          fill="currentColor"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          app-prod
        </text>
        <text
          x={298}
          y={364}
          fontSize={8}
          fill="currentColor"
          opacity={0.7}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          aws+app-prod@your-domain.com
        </text>
      </g>

      {/* Dual-profile split callout — step 9. Two highlight rings: one around
          the terraform account (state RW only), one around the OU app (admin
          inside the target accounts). The story is in the extras panel; rings
          just signal which accounts each profile touches. */}
      <g className="diagram-element" data-diff-state={ds(9)}>
        <rect
          x={26}
          y={256}
          width={238}
          height={138}
          rx={6}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={1.5}
          strokeDasharray="4 3"
          opacity={0.7}
        />
        <text
          x={26}
          y={406}
          fontSize={9}
          fill="var(--accent)"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          ↑ profile=terraform (state RW only)
        </text>

        <rect
          x={276}
          y={256}
          width={238}
          height={138}
          rx={6}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={1.5}
          strokeDasharray="4 3"
          opacity={0.7}
        />
        <text
          x={276}
          y={406}
          fontSize={9}
          fill="var(--accent)"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          ↑ profile=app-dev (admin in target only)
        </text>
      </g>
    </svg>
  );
}
