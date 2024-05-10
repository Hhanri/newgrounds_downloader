export class NewgroundsUrl {

    readonly value: string;

    constructor(value: string) {
        this.value = value;
    }

    static createAndValidate(value: string): NewgroundsUrl | undefined {
        const regexp = new RegExp('^https://www.newgrounds.com/portal/view/[0-9]+$');
        if (regexp.test(value)) return new NewgroundsUrl(value);
        console.log(`Error: invalid url ${value}`);
        return undefined;
    }

}