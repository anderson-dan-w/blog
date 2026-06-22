extras: ```hcl
# we can import this manually-created org resource into terraform later:
# org/main.tf
resource "aws_organizations_organization" "org" {
  feature_set = "ALL"
  aws_service_access_principals = ["sso.amazonaws.com"]
}

# Already created by hand? Adopt it without recreating:
import {
  to = aws_organizations_organization.org
  id = "o-XXXXXXXX"
}
```,


## WAS at step 4, which is now create tf-account in org/, so it's misplaced
extras: `\`\`\`hcl
# terraform/aws/terraform/main.tf
resource "aws_s3_bucket" "tf_state" {
  bucket = "dbnl-tfstate"
  lifecycle { prevent_destroy = true }
}

resource "aws_s3_bucket_versioning" "tf_state" {
  bucket = aws_s3_bucket.tf_state.id
  versioning_configuration { status = "Enabled" }
}

resource "aws_iam_policy" "terraform_state_access" {
  name = "TerraformStateAccess"
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      { Effect = "Allow", Action = "s3:ListBucket",
        Resource = aws_s3_bucket.tf_state.arn },
      { Effect = "Allow",
        Action = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
        Resource = "\${aws_s3_bucket.tf_state.arn}/*" },
    ],
  })
}
\`\`\``,
