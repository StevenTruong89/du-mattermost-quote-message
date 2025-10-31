import React from 'react';
import manifest from './manifest';
import type {PluginRegistry} from 'mattermost-webapp/types/plugins';
import {getPost} from 'mattermost-redux/selectors/entities/posts';
import {isSystemMessage} from 'mattermost-redux/utils/post_utils';
import type {Post} from '@mattermost/types/posts';

const pluginId = manifest.id;

// Minimal store shape we use in this plugin
type StoreLike = {
    getState: () => any;
    dispatch?: (...args: any[]) => any;
};

// Component hiển thị trong menu
function QuoteMenuItem() {
    return (
        <>
            <span style={{marginRight: '4px'}}>💬</span>
            {'Quote message'}
        </>
    );
}

// Hàm xử lý khi click menu
function handleQuote(store: StoreLike, postId: string) {
    // debug logs removed

    const post: Post | undefined = getPost(store.getState(), postId);
    if (!post) {
    // no post found
        return;
    }
    if (!post.message) {
    // post has no message
        return;
    }

    const username = store?.getState()?.entities?.users?.profiles?.[post.user_id]?.username ?? '';
    const quote = `> ${post.message.replace(/\n/g, '\n> ')}\n\n${username ? '@' + username + ' ' : ''}`;

    // Determine the most appropriate composer to insert into.
    // Insert into RHS only when the quoted post belongs to the currently open RHS thread.
    const trySelectors = [
        '#reply_textbox', // common id for reply textbox
        '#rhsContainer textarea', // RHS container textarea
        'textarea[aria-label*="Reply to thread"]',
        'textarea[aria-label*="Reply"]',
        '#post_textbox', // main composer
    ];

    // Simpler, more reliable rule:
    // - If the post has a non-empty root_id (i.e. it's a thread reply),
    //   and the RHS reply textbox is visible, prefer the RHS composer.
    const rhsTextbox = document.querySelector<HTMLTextAreaElement>('#reply_textbox');
    const rhsOpenVisible = Boolean(rhsTextbox && rhsTextbox.offsetParent !== null);
    const isPostInRhs = Boolean(post.root_id && post.root_id.trim().length > 0 && rhsOpenVisible);

    // Try to insert into the composer based on post position. Prefer RHS reply textbox
    // if the quoted post is visible in the RHS; otherwise use the main composer.
    const preferReply = isPostInRhs;
    const targetSelectors = preferReply ? ['#reply_textbox', '#rhsContainer textarea', '#post_textbox'] : ['#post_textbox', '#reply_textbox', '#rhsContainer textarea'];

    let wrote = false;
    for (const sel of targetSelectors) {
        const el = document.querySelector<HTMLTextAreaElement>(sel);
        if (el) {
            // write into this textarea
            el.focus();
            const append = (el.value ? el.value + '\n' : '') + quote;
            el.value = append;
            // trigger input events so Mattermost picks up the change
            el.dispatchEvent(new Event('input', {bubbles: true}));
            // move caret to end
            try {
                el.selectionStart = el.selectionEnd = el.value.length;
            } catch (e) {
                // ignore if not supported
            }
            wrote = true;
            break;
        }
    }

    if (!wrote) {
        // fall back to the host-handled insertText event
        window.dispatchEvent(new CustomEvent('insertText', {detail: quote}));
    }
}

class QuotePlugin {
    initialize(registry: PluginRegistry, store: StoreLike) {
    // QuotePlugin initialize

        // Accept either a post id (string) or a Post object depending on host API
        registry.registerPostDropdownMenuAction({
            text: QuoteMenuItem,
            action: (postOrId: string | Post) => {
                try {
                    const postId = typeof postOrId === 'string' ? postOrId : (postOrId as Post).id;
                    // menu action clicked
                    handleQuote(store, postId);
                } catch (e) {
                    // eslint-disable-next-line no-console
                    // error handling post dropdown action
                }
            },
            filter: (postOrId: string | Post) => {
                const post = typeof postOrId === 'string' ? getPost(store.getState(), postOrId) : (postOrId as Post);
                const allowed = Boolean(post && post.message && post.message.trim() && !isSystemMessage(post));
                // Debug: help troubleshooting in Mattermost v11 where the host may pass different shapes
                // debug info removed
                return allowed;
            },
        });

    // dropdown menu action registered
    // plugin initialized
    }
}

if (typeof window.registerPlugin !== 'function') {
    // In some dev environments the host may not expose registerPlugin — warn but don't throw
    // so the bundle can still be inspected in a browser.
    // window.registerPlugin not found
} else {
    window.registerPlugin(pluginId, new QuotePlugin());
    // window.registerPlugin called
}