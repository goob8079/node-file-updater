async function copyShareLink() {
    try {
        const input = document.querySelector("#shareLinkInput");

        if (!input) {
            console.log('Input not found')
            return;
        }

        await navigator.clipboard.writeText(input.value);
        console.log('Text copied to clipboard!');
    } catch (err) {
        console.error('Copy failed: ', err);
    }
}