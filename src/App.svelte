<script>
	import io from 'socket.io-client';
	import ChatWindow from './components/ChatWindow.svelte';

	let user = {
		id: new Date().getTime(),
		username: 'User' + new Date().getTime()
	};
	let chats = [];

	const socket = io();
	const handleIncomingMessage = (event) => socket.emit('incomingMessage', event.detail);

	socket.on('incomingMessage', chat => chats = [...chats, chat]);
</script>

<ChatWindow {user} {chats} on:incomingMessage={handleIncomingMessage} />