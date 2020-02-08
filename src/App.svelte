<script>
	import io from 'socket.io-client';
	import ChatWindow from './components/ChatWindow.svelte';

	let user = {
		id: new Date().getTime(),
		username: 'User' + new Date().getTime()
	};
	let chats = [];

	const socket = io('/chatrooms');
	const handleMessageReceive = (event) => socket.emit('messagereceive', event.detail);

	console.log('userregister');
	socket.emit('userregister', user);

	socket.on('userleave', user => {});
	socket.on('userjoin', user => {});
	socket.on('messagereceive', chat => chats = [...chats, chat]);
</script>

<ChatWindow {user} {chats} on:incomingMessage={handleMessageReceive} />

<style>
	:global(:root) {
		--chat-controls-height: 3rem;
		--chat-controls-padding-x: .25rem;
		--chat-controls-padding-y: .25rem;
		--chat-input-padding-x: .25rem;
		--chat-input-padding-y: .5rem;
		--chat-item-margin: .5rem 0;
		--chat-item-padding-x: 1rem;
		--chat-item-padding-y: 0;
		--chat-items-max-width: 100vw;
		--chat-items-min-width: 480px;
		--component-border-radius: .25rem;
		--component-border-width: 1px;
		--component-line-color: #e4e9f2;
		--component-max-height: 100%;
		--component-max-width: 100%;
		--component-min-width: 480px;
		--component-primary-background: #fff;
		--component-primary-color: #101010;
		--component-secondary-background: #f5f6f8;
		--component-secondary-color: #97a4b2;
		--component-small-font: .75rem;
		--message-border-radius: 1rem;
		--message-max-width: 30rem;
		--message-other-color: #efefef;
		--message-padding-x: 1rem;
		--message-padding-y: .5rem;
		--message-you-color: #d8ebff;
		--scrollbar-thumb-border-radius: .2rem;
		--scrollbar-thumb-color: rgba(228, 228, 228, .5);
		--scrollbar-thumb-hover-color: rgba(228, 228, 228, 1);
		--scrollbar-track-background: transparent;
		--scrollbar-width: .5rem;
		--toolbar-separator-width: .25rem;
	}
</style>