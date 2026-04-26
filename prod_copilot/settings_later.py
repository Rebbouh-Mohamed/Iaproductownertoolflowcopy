#i will add what i need in this into prod

# Email settings for production
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'  # or your email provider's SMTP server
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'your-email@gmail.com'  # your email
EMAIL_HOST_PASSWORD = 'your-app-password'  # your email password or app password
DEFAULT_FROM_EMAIL = 'your-email@gmail.com'