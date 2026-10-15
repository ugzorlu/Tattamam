/* === Contracts ============================================================ */
/**
 * Props required to generate the password reset email template.
 *
 * Encapsulates all dynamic and localized inputs needed to render
 * a fully structured transactional email for password reset requests.
 *
 * @property username - Recipient's display name.
 * @property resetLink - Unique password reset URL containing the reset token.
 * @property logoUrl - Publicly accessible 1:1 ratio logo URL used for branding.
 */
interface PasswordResetProps {
	username: string
	resetLink: string
	logoUrl: string
}

/* === Main Function ======================================================== */
/**
 * Generates a localized password reset email template.
 *
 * Returns both HTML and plain-text representations to ensure maximum
 * compatibility across email clients and improve deliverability.
 *
 * NOTE(DESIGN):
 * - Table-based layout for cross-client rendering consistency.
 * - Inline styles for maximum compatibility.
 * - Accessible structure and semantic fallback text.
 * - Clear CTA for password reset.
 * - Security-focused messaging about token expiration.
 *
 * @param props - See {@link PasswordResetProps} for details.
 * @returns Object containing subject, text, and HTML email bodies.
 */
export function passwordReset({
	username,
	resetLink,
	logoUrl,
}: PasswordResetProps) {
	const subject = "Şifre Sıfırlama"

	const text = `Merhaba ${username},

    "Şifrenizi sıfırlamak için aşağıdaki butona tıklayın."

    ${resetLink}

    "Bu link 2 saat içinde geçerliliğini yitirecektir."

    "Eğer bu isteği siz gerçekleştirmediyseniz, bu e-postayı görmezden gelin."
    `.trim()

	const html = `
    <!DOCTYPE html>
    <html>
    <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    </head>
    <body style="margin:0;padding:0;background-color:#f9fafb;
                 font-family:Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
            <tr>
                <td align="center" style="padding:24px;">
                    <table width="100%" max-width="480"
                    style="background:#ffffff;border-radius:12px;padding:24px;">
                        
                        <!-- Logo -->
                        <tr>
                            <td align="center" style="padding-bottom:16px;">
                                <img 
                                    src="${logoUrl}"
                                    alt="Tattamam"
                                    width="256"
                                    height="64"
                                    style="display:block; border-radius:12px;"
                                />
                            </td>
                        </tr>

                        <!-- Title -->
                        <tr>
                            <td style="font-size:20px;font-weight:600;
                            text-align:center;padding-bottom:12px;">
                                Şifrenizi Sıfırlayın
                            </td>
                        </tr>

                        <!-- Body -->
                        <tr>
                            <td style="font-size:14px;color:#374151;
                                       text-align:center;padding-bottom:20px;">
                                Merhaba ${username},
                                <br/><br/>
                                Şifrenizi sıfırlamak için 
                                aşağıdaki butona tıklayın.
                            </td>
                        </tr>

                        <!-- CTA -->
                        <tr>
                            <td align="center" style="padding-bottom:20px;">
                                <a href="${resetLink}"
                                style="display:inline-block;padding:12px 24px;
                                       background-color:#570119;color:#ffffff;
                                       text-decoration:none;border-radius:8px;
                                       font-size:14px;font-weight:600;">
                                   Şifreyi Sıfırla
                                </a>
                            </td>
                        </tr>

                        <!-- Security Notice -->
                        <tr>
                            <td style="font-size:12px;color:#6b7280;text-align:center;
                                       padding:16px;background-color:#f3f4f6;border-radius:8px;">
                                <strong>Güvenlik Uyarısı:</strong><br/>
                                Bu link 2 saat içinde geçerliliğini yitirecektir.<br/><br/>
                                Eğer bu isteği siz gerçekleştirmediyseniz,
                                 bu e-postayı görmezden gelin.
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `.trim()

	return {
		subject,
		text,
		html,
	}
}
