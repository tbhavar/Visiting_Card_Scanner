# EmailJS Setup Guide

Follow these steps to configure the email feature for your Card Scanner app.

## 1. Create an EmailJS Account

1. Go to [emailjs.com](https://www.emailjs.com/) and sign in (you already have an account)
2. The free plan allows **200 emails/month**

## 2. Connect Your Email (Gmail)

1. Go to **Email Services** → **Add New Service**
2. Select **Gmail**
3. Click **Connect Account** and authorize your Gmail (`your.email@gmail.com`)
4. Click **Create Service**
5. **Copy the Service ID** (e.g., `service_abc123`) — you'll need this for GitHub Secrets

## 3. Create an Email Template

1. Go to **Email Templates** → **Create New Template**
2. Set the **Subject** to:
   ```
   Nice meeting you, {{to_name}}! — {{from_name}}
   ```
3. Set the **Content** to the HTML below:

```html
<div style="font-family: 'Outfit', 'Inter', 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; border: 1px solid #f0f0f5; box-shadow: 0 20px 40px rgba(0,0,0,0.08);">
  
  <!-- Header Section -->
  <div style="background: #0f172a; background: radial-gradient(circle at 10% 10%, #2563eb 0%, #0f172a 100%); padding: 45px 30px; text-align: center; position: relative;">
    <div style="position: absolute; top:0; left:0; right:0; height: 100%; opacity: 0.1; background-image: radial-gradient(#ffffff 1px, transparent 1px); background-size: 20px 20px;"></div>
    <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 800; letter-spacing: -1px; line-height: 1.2; text-shadow: 0 4px 10px rgba(0,0,0,0.3);">Great connecting with you!</h1>
    <div style="display: inline-block; margin-top: 15px; padding: 6px 16px; background: rgba(255,255,255,0.1); border-radius: 100px; backdrop-filter: blur(5px);">
        <p style="color: #60a5fa; margin: 0; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px;">{{owner_title}}</p>
    </div>
  </div>
  
  <!-- Body Section -->
  <div style="padding: 40px 35px;">
    <p style="font-size: 18px; color: #1e293b; line-height: 1.6; margin-bottom: 25px;">
      Hi {{to_name}},
    </p>
    
    <p style="font-size: 17px; color: #475569; line-height: 1.7;">
      It was a pleasure meeting you at <strong>{{meeting_notes}}</strong>. I'm reaching out to share my professional contact details so we can stay in touch and explore potential synergies.
    </p>
    
    <!-- Contact Info Card -->
    <div style="background: #f8fafc; border-radius: 20px; padding: 30px; margin: 35px 0; border: 1px solid #e2e8f0; position: relative; overflow: hidden;">
      <div style="position: absolute; left: 0; top: 0; bottom: 0; width: 6px; background: #2563eb;"></div>
      <h3 style="color: #0f172a; margin: 0 0 20px 0; font-size: 19px; font-weight: 700;">My Office Address & Details</h3>
      
      <div style="display: grid; gap: 12px; font-size: 16px; color: #334155;">
        <p style="margin: 8px 0;"><strong>Name:</strong> {{from_name}}</p>
        <p style="margin: 8px 0;"><strong>Email:</strong> <a href="mailto:{{from_email}}" style="color: #2563eb; text-decoration: none;">{{from_email}}</a></p>
        <p style="margin: 8px 0;"><strong>Phone:</strong> {{from_phone}}</p>
        <p style="margin: 8px 0;"><strong>Website:</strong> <a href="https://{{website_url}}" style="color: #2563eb; text-decoration: none; font-weight: 600;">{{website_url}}</a></p>
      </div>
    </div>
    
    <!-- Action Buttons -->
    <div style="text-align: center; margin: 40px 0; display: flex; flex-direction: column; align-items: center; gap: 18px;">
      <a href="{{linkedin_url}}" style="display: block; background: #0077b5; color: #ffffff; padding: 16px 45px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 16px; width: 240px; box-shadow: 0 10px 20px rgba(0, 119, 181, 0.2); transition: transform 0.2s ease;">
        Connect on LinkedIn
      </a>
      <a href="{{vcf_url}}" style="display: block; background: #1e293b; color: #ffffff; padding: 16px 45px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 16px; width: 240px; box-shadow: 0 10px 20px rgba(30, 41, 59, 0.15); transition: transform 0.2s ease;">
        Save Contact (VCF)
      </a>
    </div>
    
    <p style="font-size: 16px; color: #64748b; line-height: 1.6; text-align: center; margin-top: 40px;">
      Looking forward to hearing from you soon.
    </p>
    
    <div style="text-align: center; margin-top: 15px;">
        <p style="margin: 0; color: #1e293b; font-size: 17px; font-weight: 800;">{{from_name}}</p>
        <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 13px;">{{owner_title}}</p>
    </div>
  </div>
  
  <!-- Footer -->
  <div style="background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; letter-spacing: 1px; text-transform: uppercase; font-weight: 600;">
    Digital Business Card &bull; CA Tanmay R Bhavar
  </div>
</div>
```
```

4. In the **Settings** tab:
   - **To Email**: `{{to_email}}`
   - **From Name**: `{{from_name}}`
   - **Reply To**: `{{from_email}}`
5. Click **Save**
6. **Copy the Template ID** (e.g., `template_xyz789`)

## 4. Get Your Public Key

1. Go to **Account** → **General**  
2. Copy the **Public Key** (e.g., `user_AbCdEfGhIjKlMn`)

## 5. Configure GitHub Secrets

Go to your repository: [github.com/your-username/Visiting_Card_Scanner](https://github.com/your-username/Visiting_Card_Scanner)

Navigate to: **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Add these secrets:

| Secret Name | Value |
|---|---|
| `AUTH_PASSWORD_HASH` | `cf28d56f01623c011bf817b6cbc103fc0eff415f446ac1fb05baf76e633bb016` |
| `EMAILJS_PUBLIC_KEY` | Your Public Key from step 4 |
| `EMAILJS_SERVICE_ID` | Your Service ID from step 2 |
| `EMAILJS_TEMPLATE_ID` | Your Template ID from step 3 |
| `OWNER_NAME` | `Your Full Name` |
| `OWNER_EMAIL` | `your.email@gmail.com` |
| `OWNER_PHONE` | `+91 98765 43210` |
| `OWNER_LINKEDIN` | `https://www.linkedin.com/in/tbhavar/` |
| `OWNER_WEBSITE` | `tbhavar.in` |
| `OWNER_TITLE` | `Chartered Accountant | GST & Tax Consultant` |
| `OWNER_VCF_URL` | `https://cardscanner.tbhavar.in/assets/contacts.vcf` |

## 6. Enable GitHub Pages

1. Go to repo **Settings** → **Pages**
2. Under **Build and deployment**, select **Source**: **GitHub Actions**
3. Push code to `main` branch — the workflow will auto-deploy

## 7. Test

1. Visit `https://your-username.github.io/Visiting_Card_Scanner/`
2. Login with your password
3. Scan a card → confirm details → click **Send Email**
4. Check the recipient's inbox!

## Template Variables Reference

| Variable | Source |
|---|---|
| `{{to_email}}` | Scanned contact's email |
| `{{to_name}}` | Scanned contact's name |
| `{{from_name}}` | `OWNER_NAME` secret |
| `{{from_email}}` | `OWNER_EMAIL` secret |
| `{{from_phone}}` | `OWNER_PHONE` secret |
| `{{linkedin_url}}` | `OWNER_LINKEDIN` secret |
| `{{website_url}}` | `OWNER_WEBSITE` secret |
| `{{owner_title}}` | `OWNER_TITLE` secret |
| `{{vcf_url}}` | `OWNER_VCF_URL` secret |
| `{{meeting_notes}}` | Notes field from the app |
| `{{business_name}}` | Scanned business name |
