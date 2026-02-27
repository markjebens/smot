document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('#contact-form');
    const status = document.querySelector('#contact-form-status');
    const startedAtInput = document.querySelector('#contact-started-at');
    const honeypotInput = document.querySelector('#contact-honeypot');
    const interactedInput = document.querySelector('#contact-interacted');

    if (!form || !status) {
        return;
    }

    const recipientEmail = 'booking@singlemotheroftwo.com';
    const minFillTimeMs = 4000;

    function setStatus(message, isError) {
        status.textContent = message;
        status.classList.toggle('contact-status-error', Boolean(isError));
    }

    startedAtInput.value = String(Date.now());
    if (interactedInput) {
        interactedInput.value = '0';
    }

    const markInteraction = () => {
        if (interactedInput) {
            interactedInput.value = '1';
        }
    };
    form.addEventListener('input', markInteraction);
    form.addEventListener('focusin', markInteraction);

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const name = form.elements.name.value.trim();
        const email = form.elements.email.value.trim();
        const subject = form.elements.subject.value.trim();
        const message = form.elements.message.value.trim();
        const startedAt = Number(startedAtInput.value);
        const interacted = interactedInput ? interactedInput.value === '1' : false;

        if (!name || !email || !subject || !message) {
            setStatus('Please complete all fields.', true);
            return;
        }

        if (honeypotInput.value.trim() !== '') {
            setStatus('Unable to send message.', true);
            return;
        }

        if (!Number.isFinite(startedAt) || (Date.now() - startedAt) < minFillTimeMs) {
            setStatus('Please take a moment before submitting.', true);
            return;
        }

        if (!interacted) {
            setStatus('Unable to send message. Please try again.', true);
            return;
        }

        const body = [
            `Name: ${name}`,
            `Email: ${email}`,
            '',
            message,
        ].join('\n');

        const mailtoUrl = `mailto:${encodeURIComponent(recipientEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        setStatus('Opening your email app...', false);
        window.location.href = mailtoUrl;
    });
});
