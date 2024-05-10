import { Browser } from "puppeteer";

export class NewgroundsAuth {

    private readonly browser: Browser;

    #loginUrl = "https://www.newgrounds.com/login";

    isSignedIn: boolean = false;

    constructor(browser: Browser) {
        this.browser = browser;
    }

    async signIn(email: string, password: string): Promise<boolean> {
        const page = (await this.browser.pages())[0];
        await page.goto(this.#loginUrl);

        const formSelector = "#passport_main div.pod div.pod-body div.flexbox.align-center div.passportform.checkboxes.twoX form";
        const form = await page.waitForSelector(formSelector);
        
        const emailTextField = await form.waitForSelector('input.PassportTextfield[name="username"]');
        await emailTextField.type(email);

        const passwordTextField = await form.waitForSelector('input.PassportTextfield[name="password"]');
        await passwordTextField.type(password);

        const button = await form.waitForSelector('button.PassportLoginBtn');
        await button.click();

        await page.waitForNetworkIdle({timeout: undefined});

        this.isSignedIn = page.url() === "https://www.newgrounds.com/";
        return this.isSignedIn;
    }

}
