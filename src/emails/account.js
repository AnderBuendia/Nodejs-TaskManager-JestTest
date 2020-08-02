const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// sgMail.send({
//     to: 'ibysytho@gmail.com',
//     from: 'ibysytho@gmail.com',
//     subject: 'This is my first mail',
//     text: 'I hope this one actually get to you'
// });

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'ibysytho@gmail.com',
        subject: 'Welcome to the App',
        text: `Welcome to the app, ${name}. Let me know how you get along with the app.`
    })
}

const sendCancelationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'ibysytho@gmail.com',
        subject: 'Sorry to see you go',
        text: `Good bye my friend, ${name}. I hope to see you back sometime soon.`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail
}