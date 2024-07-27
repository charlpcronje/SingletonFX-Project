/**
 * @file ./modules/help.js
 * @description Help Module
 */
export class Help {
    constructor(fx) {
        this.fx = fx;
        this.helpContent = null;
    }

    async loadContent() {
        if (!this.helpContent) {
            this.helpContent = await this.fx.load({
                type: "html",
                path: "/help.html"
            });
        }
    }

    async show() {
        await this.loadContent();
        if (!document.getElementById('fx-help-container')) {
            const helpContainer = document.createElement('div');
            helpContainer.id = 'fx-help-container';
            document.body.appendChild(helpContainer);
        }
        document.getElementById('fx-help-container').innerHTML = this.helpContent;
        document.querySelector('.overlay').style.display = 'flex';
    }

    hide() {
        const overlay = document.querySelector('.overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }
}