const { Plugin } = require('powercord/entities');
const { inject, uninject } = require('powercord/injector');
const { getModule } = require('powercord/webpack');

module.exports = class DoubleClickVc extends Plugin {
    async startPlugin() {
        const ChannelItem = await getModule(m => m.default && m.default.displayName === 'ChannelItem');
        const oDefault = ChannelItem.default;
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
        Object.assign(ChannelItem.default, oDefault);
    }

    pluginWillUnload() {
        uninject('double-click-vc');
    }

    getNestedProp(obj, path) {
        return path.split('.').reduce(function (obj, prop) {
            return obj && obj[prop];
        }, obj);
    }
};
