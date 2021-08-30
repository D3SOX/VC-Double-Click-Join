const { Plugin } = require('powercord/entities');
const { inject, uninject } = require('powercord/injector');
const { getModule } = require('powercord/webpack');

module.exports = class DoubleClickVc extends Plugin {
    async startPlugin() {
        const ChannelItem = await getModule(m => m.default?.displayName === 'ChannelItem');
        inject('double-click-vc', ChannelItem, 'default', (args, res) => {
            const channel = this.getNestedProp(res, 'props.children.props.children.1.props.children.1.props.children.1.props.channel');
            if (channel && (channel.type === 2 || channel.type === 13)) {
                const props = this.getNestedProp(res, 'props.children.props.children.1.props.children.0.props');
                if (props) {
                    props.onDoubleClick = props.onClick;
                    delete props.onClick;
                } else {
                    this.log('Failed to get nested props.');
                }
            } else if (!channel) {
                this.log('Failed to determine channel type.');
            }

            return res;
        });

        const Mention = await getModule(m => m.default?.displayName === 'Mention');
        inject('double-click-vc-mention', Mention, 'default', (args, res) => {
            const label = this.getNestedProp(res, 'props.children.0.props.aria-label');
            if (label && label === 'Voice Channel') {
                const { props } = res;
                props.onDoubleClick = props.onClick;
                delete props.onClick;
            }

            return res;
        });

        ChannelItem.default.displayName = 'ChannelItem';
        Mention.default.displayName = 'Mention';
    }

    pluginWillUnload() {
        uninject('double-click-vc');
        uninject('double-click-vc-mention');
    }

    getNestedProp(obj, path) {
        return path.split('.').reduce(function (obj, prop) {
            return obj && obj[prop];
        }, obj);
    }
};
