<script>
	import io from 'socket.io-client';
	import ChatWindow from './components/ChatWindow.svelte';

	let user = {
		id: new Date().getTime(),
		username: 'User' + new Date().getTime()
	};
	let chats = [];

	const handleIncomingMessage = (event) => {
		chats = [...chats, event.detail];
	};
</script>

<ChatWindow {user} {chats} on:incomingMessage={handleIncomingMessage} />