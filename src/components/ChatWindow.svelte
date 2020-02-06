<script>
	import { onMount, createEventDispatcher } from 'svelte';
	import moment from 'moment';

    export let user;
	export let chats = [];
	
    let chatWindow;
	let chatInput;
	
	const dispatch = createEventDispatcher();

	const handleSendMessage = () => {
		let content = chatInput.value.trim();
		chatInput.value = '';
		if(content === '') return;

		dispatch('incomingMessage', { 
			message: { 
				content, 
				time: new Date() }, 
			user });
	};

	onMount(() => {
		var observer = new MutationObserver(mutations => {
			chatWindow.scrollTop = chatWindow.scrollHeight - chatWindow.clientHeight;
		});
		observer.observe(chatWindow, { childList: true });
	});
</script>

<main>
	<div class="chat-items" bind:this={chatWindow}>
		{#each chats as chat}
			<div class={chat.user.id === user.id ? 'chat-item you' : 'chat-item'}>
				<div class="chat">
					<div class="user">
						<span class="username">{chat.user.id === user.id ? 'You' : chat.user.username}</span>
					</div>
					<div class="message">
						<span class="content">{chat.message.content}</span>
						<span class="time">{moment(chat.message.time).format('h:mm:ss a')}</span>
					</div>
				</div>
			</div>
		{/each}
	</div>
	<form class="chat-controls">
		<input type="text" class="chat-input" placeholder="Type a message..." bind:this={chatInput} />
		<button type="submit" on:click|preventDefault="{handleSendMessage}">Send</button>
	</form>
</main>

<style>
	:root {
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

	main {
		align-items: stretch;
		background-color: var(--primary-bg-color);
		color:var(--primary-color);
		height: 100%;
	}

	.chat-items {
		height: calc(100vh - 3rem - 1px - .5rem);
		overflow-y: scroll;
		overflow-x: hidden;
		min-width: var(--min-width);
		max-width: var(--max-width);;
		margin: 0 auto;
	}

	::-webkit-scrollbar {
		width: .5rem;
	}

	::-webkit-scrollbar-track {
		background-color: transparent;
	}

	::-webkit-scrollbar-thumb {
		background: var(--scrollbar-thumb-color);
		border-radius: .2rem;
		opacity: .1;
	}

	::-webkit-scrollbar-thumb:hover {
		background:var(--scrollbar-thumb-hover-color);
		opacity: 1;
	}

	.chat-item {
		display: flex;
		margin: .5rem 0;
		padding: 0 1rem;
		width: calc(100% - 2rem);
	}

	.user {
		margin-bottom: .25rem;
	}

	.you .user {
		text-align: right;
	}

	.user .username {
		color: var(--secondary-color);
		font-size: smaller;
	}

	.message {
		background-color: var(--message-color);
		border-radius: 0 1rem 1rem 1rem;
		justify-content: space-between;
		max-width: 30rem;
		padding: .5rem 1rem;
	}

	.you {
		justify-content: flex-end;
	}

	.you .message {
		background-color: var(--message-color-user);
		border-radius: 1rem 0 1rem 1rem;
	}

	.message .time {
		color: var(--secondary-color);
		display: block;
		font-size: smaller;
		text-align: right;
	}

	.chat-controls {
		border-top: 1px solid var(--line-color);
		height: 3rem;
	}

	.chat-controls {
		border-top: 1px solid var(--line-color);
		height: 3rem;
	}

	.chat-controls {
		background-color: var(--secondary-bg-color);
		display: flex;
		min-width: var(--min-width);
		max-width: calc(var(--max-width) - .5rem);
		margin: 0 auto;
		padding: .25rem;
	}

	.chat-controls .chat-input {
		background-color: var(--primary-bg-color);
		border-radius: .25rem;
		border: none;
		color: var(--primary-color);
		flex: 2;
		outline: none;
		padding: .5rem .25rem;
		margin-right: .25rem;
	}

	.chat-controls button {
		background-color: var(--secondary-bg-color);
		border-radius: .25rem;
		border: 1px solid var(--line-color);
		color: var(--primary-color);
		cursor: pointer;
		padding: 0 1rem;
	}
</style>