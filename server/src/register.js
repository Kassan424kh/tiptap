const register = ({ strapi }) => {
    strapi.customFields.register({
        name: "tiptap-input",
        plugin: "tiptap",
        type: "richtext",
    });
};

export default register;
