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
		--primary-bg-color: #fff;
		--primary-color: #101010;
		--secondary-bg-color: #F5F6F8;
		--secondary-color: #97A4B2;
		--line-color: #E4E9F2;
		--max-width: 100vw;
		--min-width: 480px;
		--message-color: #EFEFEF;
		--message-color-user: #D8EBFF;
		--scrollbar-thumb-color: rgba(228, 228, 228, .5);
		--scrollbar-thumb-hover-color: rgba(228, 228, 228, 1);
	}
</style>