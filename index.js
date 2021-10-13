const { Plugin } = require('powercord/entities');
const { inject, uninject } = require('powercord/injector');
const { getModule } = require('powercord/webpack');

module.exports = class DoubleClickVc extends Plugin {
    async startPlugin() {
        const ChannelItem = await getModule(m => m.default?.displayName === 'ChannelItem');
        inject('double-click-vc', ChannelItem, 'default', (args, res) => {
            const channel = this.getChannel(res);
            if (channel) {
                if (channel.type === 2 || channel.type === 13) {
                    const clickable = this.getClickable(res);
                    if (clickable) {
                        clickable.onDoubleClick = clickable.onClick;
                        delete clickable.onClick;
                    }
                }
            } else {
                this.log('Failed to find channel.');
            }

            return res;
        });

        const Mention = await getModule(m => m.default?.displayName === 'Mention');
        inject('double-click-vc-mention', Mention, 'default', (args, res) => {
            const label = this.getLabel(res);
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

    getChannel(obj) {
        for (const key in obj) {
            const inner = obj[key];
            if (inner && typeof inner === 'object') {
                if (key === 'channel') {
                    return inner;
                } else if (/props|children|[0-9]/.test(key)) {
                    return this.getChannel(inner);
                }
            }
        }
        return null;
    }

    getClickable(obj) {
        for (const key in obj) {
            const inner = obj[key];
            if (inner && typeof inner === 'object') {
                if (inner.onClick && inner.role === 'button') {
                    return inner;
                } else if (/props|children|[0-9]/.test(key)) {
                    return this.getClickable(inner);
                }
            }
        }
        return null;
    }

    getLabel(obj) {
        for (const key in obj) {
            const inner = obj[key];
            if (inner) {
                if (key === 'aria-label') {
                    return inner;
                } else if (typeof inner === 'object' && /props|children|[0-9]/.test(key)) {
                    return this.getLabel(inner);
                }
            }
        }
        return null;
    }
};
