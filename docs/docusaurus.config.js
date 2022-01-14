const lightCodeTheme = require("prism-react-renderer/themes/github")
const darkCodeTheme = require("prism-react-renderer/themes/palenight")

// With JSDoc @type annotations, IDEs can provide config autocompletion
/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
    title: "ZK-Keeper Documentation",
    url: "https://akinovak.github.io",
    baseUrl: "/zk-keeper/",
    favicon: "/img/favicon.ico",
    onBrokenLinks: "throw",
    onBrokenMarkdownLinks: "warn",
    organizationName: "ZK-Keeper",
    projectName: "zk-keeper",
    trailingSlash: false,

    presets: [
        [
            "@docusaurus/preset-classic",
            /** @type {import('@docusaurus/preset-classic').Options} */
            ({
                docs: {
                    sidebarPath: require.resolve("./sidebars.js"),
                    editUrl: "https://github.com/akinovak/zk-keeper/edit/main/",
                    routeBasePath: "/"
                },
                theme: {
                    customCss: require.resolve("./src/css/custom.css")
                }
            })
        ]
    ],

    themeConfig:
        /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
        ({
            navbar: {
                title: "ZK-Keeper",
                items: [
                    {
                        href: "https://github.com/appliedzkp/zk-keeper",
                        label: "GitHub",
                        position: "right"
                    }
                ]
            },
            footer: {
                style: "dark",
                links: [
                    {
                        title: "Docs",
                        items: [
                            {
                                label: "Introduction",
                                to: "/"
                            },
                            {
                                label: "References",
                                to: "/references"
                            }
                        ]
                    },
                    {
                        title: "Community",
                        items: [
                            {
                                label: "Medium",
                                href: "https://medium.com/privacy-scaling-explorations"
                            },
                            {
                                label: "Twitter",
                                href: "https://twitter.com/PrivacyScaling"
                            }
                        ]
                    },
                    {
                        title: "More",
                        items: [
                            {
                                label: "Contracts",
                                href: "https://github.com/appliedzkp/semaphore"
                            },
                            {
                                label: "JS Library",
                                href: "https://github.com/appliedzkp/libsemaphore"
                            }
                        ]
                    }
                ],
                copyright: `Copyright © 2022 ZK-Keeper`
            },
            prism: {
                theme: lightCodeTheme,
                darkTheme: darkCodeTheme
            }
        })
}
