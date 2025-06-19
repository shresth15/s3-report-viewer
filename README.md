# S3 Report Viewer - Deployment Guide

A React-based static web application for viewing HTML reports stored in AWS S3.

## 🏗️ Architecture Overview

```
S3 Bucket Structure:
├── index.html (React app)
├── static/ (JS/CSS files)
├── reports.json (reports structure)
├── ProjectA/
│   ├── 2025-06-18/
│   │   ├── report-2025-06-18-09AM.html
│   │   └── report-2025-06-18-11AM.html
│   └── 2025-06-17/
│       └── report-2025-06-17-10AM.html
└── ProjectB/
    └── 2025-06-16/
        └── report-2025-06-16-08AM.html
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- AWS CLI configured
- S3 bucket with public read access

### 1. Setup React Project

```bash
# Create new React app
npx create-react-app s3-report-viewer
cd s3-report-viewer

# Install dependencies
npm install lucide-react

# Replace src/App.js with the provided React code
# Update the S3_BUCKET_URL in the code to your bucket URL
```

### 2. Configure Your Environment

The app includes a toggle for local development vs production deployment.

**For Local Development/Demo:**
```javascript
const USE_LOCAL_JSON = true; // Enable local JSON mode
```

**For Production S3 Deployment:**
```javascript
const USE_LOCAL_JSON = false; // Use S3 bucket
const S3_BUCKET_URL = 'https://your-bucket-name.s3.amazonaws.com';
```

### 3. Local Development Setup

For local development and testing:

```bash
# Place reports.json in the public folder
cp reports.json public/

# Create demo report files in public folder (optional)
mkdir -p public/demo-reports/ProjectA/2025-06-18
echo '<html><body><h1>Demo Report</h1><p>This is a local demo report.</p></body></html>' > public/demo-reports/ProjectA/2025-06-18/report-2025-06-18-09AM.html

# Start development server
npm start
```

The app will load `reports.json` from `/reports.json` when in local mode.

### 3. Build the Application

```bash
# For local development - set USE_LOCAL_JSON = true
npm start

# For production build - set USE_LOCAL_JSON = false first
npm run build
```

## 📦 AWS S3 Setup

### Step 1: Create S3 Bucket

```bash
# Create bucket (replace with your bucket name)
aws s3 mb s3://your-report-viewer-bucket

# Enable static website hosting
aws s3 website s3://your-report-viewer-bucket \
  --index-document index.html \
  --error-document index.html
```

### Step 2: Configure Bucket Policy

Create a `bucket-policy.json` file:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-report-viewer-bucket/*"
    }
  ]
}
```

Apply the policy:
```bash
aws s3api put-bucket-policy --bucket your-report-viewer-bucket --policy file://bucket-policy.json
```

### Step 3: Configure CORS

Create a `cors-config.json` file:

```json
{
  "CORSRules": [
    {
      "AllowedOrigins": ["*"],
      "AllowedMethods": ["GET", "HEAD"],
      "AllowedHeaders": ["*"],
      "MaxAgeSeconds": 3000
    }
  ]
}
```

Apply CORS configuration:
```bash
aws s3api put-bucket-cors --bucket your-report-viewer-bucket --cors-configuration file://cors-config.json
```

## 🛠️ Development Workflow

### Local Development Mode

1. **Enable local mode** in the React code:
   ```javascript
   const USE_LOCAL_JSON = true;
   ```

2. **Create local structure:**
   ```
   public/
   ├── reports.json
   └── demo-reports/
       ├── ProjectA/
       │   └── 2025-06-18/
       │       └── report-2025-06-18-09AM.html
       └── ProjectB/
           └── 2025-06-16/
               └── report-2025-06-16-08AM.html
   ```

3. **Run development server:**
   ```bash
   npm start
   ```

### Production Deployment

1. **Switch to production mode:**
   ```javascript
   const USE_LOCAL_JSON = false;
   const S3_BUCKET_URL = 'https://your-actual-bucket.s3.amazonaws.com';
   ```

2. **Build and deploy:**
   ```bash
   npm run build
   aws s3 sync build/ s3://your-bucket-name/
   ```

## 📂 Upload Files to S3

### Upload React App

```bash
# Upload the built React app
aws s3 sync build/ s3://your-report-viewer-bucket/

# Upload reports.json
aws s3 cp reports.json s3://your-report-viewer-bucket/reports.json
```

### Upload Report Files

```bash
# Example: Upload report files following the structure
aws s3 cp report-2025-06-18-09AM.html s3://your-report-viewer-bucket/ProjectA/2025-06-18/
aws s3 cp report-2025-06-18-11AM.html s3://your-report-viewer-bucket/ProjectA/2025-06-18/
aws s3 cp report-2025-06-17-10AM.html s3://your-report-viewer-bucket/ProjectA/2025-06-17/
```

Or use sync for bulk uploads:
```bash
# If you have local folders matching the structure
aws s3 sync ./reports/ s3://your-report-viewer-bucket/ --exclude "*.DS_Store"
```

## 🌐 Access Your Application

Your app will be available at:
```
http://your-report-viewer-bucket.s3-website-region.amazonaws.com
```

Find your exact URL in the AWS Console under S3 > Bucket > Properties > Static Website Hosting.

## 🔧 Configuration Options

### Custom Domain (Optional)

1. **CloudFront Distribution**: Create a CloudFront distribution pointing to your S3 bucket
2. **Route 53**: Set up a custom domain name
3. **SSL Certificate**: Use AWS Certificate Manager for HTTPS

### Environment-Specific Configurations

You can create different bucket configurations for different environments:

- **Development**: `dev-report-viewer-bucket`
- **Staging**: `staging-report-viewer-bucket`  
- **Production**: `prod-report-viewer-bucket`

## 📋 Sample HTML Report

Here's a sample HTML report file you can use for testing:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Sample Report - ProjectA - 2025-06-18 09AM</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f0f0f0; padding: 15px; border-radius: 5px; }
        .content { margin-top: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Daily Report - ProjectA</h1>
        <p><strong>Date:</strong> 2025-06-18</p>
        <p><strong>Time:</strong> 09:00 AM</p>
        <p><strong>Generated:</strong> Wed Jun 18 2025</p>
    </div>
    
    <div class="content">
        <h2>Summary</h2>
        <p>This is a sample report showing project metrics and status updates.</p>
        
        <h2>Metrics</h2>
        <table>
            <tr><th>Metric</th><th>Value</th><th>Status</th></tr>
            <tr><td>Tasks Completed</td><td>23</td><td>✅ Good</td></tr>
            <tr><td>Issues Found</td><td>2</td><td>⚠️ Attention</td></tr>
            <tr><td>Performance Score</td><td>94%</td><td>✅ Excellent</td></tr>
        </table>
        
        <h2>Notes</h2>
        <ul>
            <li>All critical systems operational</li>
            <li>Minor issue with backup process - investigating</li>
            <li>Performance improvements implemented</li>
        </ul>
    </div>
</body>
</html>
```

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure CORS is properly configured on your S3 bucket

2. **404 Errors**: Verify that:
   - `reports.json` exists at the bucket root
   - Report files are in the correct folder structure
   - Bucket policy allows public read access

3. **Blank Page**: Check browser console for JavaScript errors

4. **Iframe Not Loading**: Ensure report HTML files are accessible and have proper content-type headers

### Testing Checklist

- [ ] S3 bucket created and configured for static hosting
- [ ] Bucket policy allows public read access
- [ ] CORS configuration applied
- [ ] React app built and uploaded
- [ ] `reports.json` uploaded to bucket root
- [ ] Sample report files uploaded in correct structure
- [ ] Application accessible via S3 website URL

## 🔒 Security Considerations

- This setup allows public read access to all files in the bucket
- Consider implementing AWS Cognito for user authentication if needed
- Use CloudFront with signed URLs for sensitive reports
- Regularly review and rotate AWS access keys

## 📈 Monitoring & Maintenance

- Monitor S3 access logs for usage patterns
- Set up CloudWatch alarms for error rates
- Regularly update the `reports.json` file as new reports are added
- Consider automating report uploads with AWS Lambda

---

## 🆘 Need Help?

- Check AWS S3 documentation for bucket configuration
- Verify React build process completed successfully  
- Test individual file URLs directly in browser
- Use browser developer tools to debug CORS and network issues