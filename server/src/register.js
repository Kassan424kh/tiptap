const register = ({ strapi }) => {
    strapi.customFields.register({
        name: "tiptap-input",
        plugin: "tiptap",
        type: "string",
    });
};

export default register;
