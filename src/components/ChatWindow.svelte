<script>
	import { onMount, createEventDispatcher } from 'svelte';
	import moment from 'moment';

	export let user;
	export let chats = [];
	export let keyboardActivity = true;

	let chatWindow;
	let chatInput;

	const dispatch = createEventDispatcher();

	function handleSendMessage() {
		let content = chatInput.value.trim();
		chatInput.value = '';

		if(content !== '') {
			dispatch('incomingMessage', {
				message: {
					content,
					time: new Date() },
				user
			});
		}
	}

	function handleKeydown(event) {
		if(event.keyCode !== 13) {
			dispatch('keyboardActivity', user);
		}
	}

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
	{#if keyboardActivity}
		<span class="keyboard-activity">Someone is typing...</span>
	{/if}
	<form class="chat-controls">
		<input type="text" class="chat-input" placeholder="Type a message..." bind:this={chatInput} on:keydown={handleKeydown} />
		<button type="submit" on:click|preventDefault="{handleSendMessage}">Send</button>
	</form>
</main>

<style>
	:root {
		--chat-controls-outer-height: calc(var(--chat-controls-height) + var(--component-border-width) + (var(--chat-controls-padding-y) * 2));
	}

	main {
		align-items: stretch;
		background: var(--component-primary-background);
		color: var(--component-primary-color);
		height: var(--component-max-height);
	}

	.chat-items {
		height: calc(var(--component-max-height) - var(--chat-controls-outer-height));
		margin: 0 auto;
		max-width: var(--chat-items-max-width);
		overflow-x: hidden;
		overflow-y: scroll;
		position: relative;
	}

	::-webkit-scrollbar {
		width: var(--scrollbar-width);
	}

	::-webkit-scrollbar-track {
		background: var(--scrollbar-track-background);
	}

	::-webkit-scrollbar-thumb {
		background: var(--scrollbar-thumb-color);
		border-radius: var(--scrollbar-thumb-border-radius);
		opacity: .1;
	}

	::-webkit-scrollbar-thumb:hover {
		background: var(--scrollbar-thumb-hover-color);
		opacity: 1;
	}

	.chat-item {
		display: flex;
		margin: var(--chat-item-margin);
		padding: var(--chat-item-padding-y) var(--chat-item-padding-x);
		width: calc(var(--chat-item-max-width) - (var(--chat-item-padding-x) * 2));
	}

	.chat-item .chat {
		max-width: 45%;
	}

	.chat-item.you .chat .user {
		text-align: right;
	}

	.chat-item .chat .user .username {
		color: var(--component-secondary-color);
		font-size: var(--component-small-font);
	}

	.message {
		background: var(--message-other-color);
		border-radius: 0 var(--message-border-radius) var(--message-border-radius) var(--message-border-radius);
		justify-content: space-between;
		max-width: var(--messsage-max-width);
		padding: var(--message-padding-y) var(--message-padding-x);
		word-break: break-word;
	}

	.you {
		justify-content: flex-end;
	}

	.you .message {
		background: var(--message-you-color);
		border-radius: var(--message-border-radius) 0 var(--message-border-radius) var(--message-border-radius);
	}

	.message .time {
		color: var(--component-secondary-color);
		display: block;
		font-size: var(--component-small-font);
		text-align: right;
	}

	.chat-controls {
		background: var(--component-secondary-background);
		border-top: var(--component-border-width) solid var(--component-line-color);
		display: flex;
		height: var(--chat-controls-height);
		margin: 0 auto;
		padding: var(--chat-controls-padding-y) var(--chat-controls-padding-x);
		width: calc(100% - (var(--chat-controls-padding-x) * 2));
	}

	.chat-controls .chat-input {
		background: var(--component-primary-background);
		border-radius: var(--component-border-radius);
		border: var(--component-border-width) solid var(--component-line-color);
		color: var(--component-primary-color);
		flex: 2;
		margin-right: var(--toolbar-separator-width);
		outline: none;
		padding: var(--chat-input-padding-y) var(--chat-input-padding-x);
	}

	.chat-controls button {
		background: var(--component-secondary-background);
		border-radius: var(--component-border-radius);
		border: 1px solid var(--component-line-color);
		color: var(--component-primary-color);
		cursor: pointer;
		padding: 0 1rem;
	}

	.keyboard-activity {
		background: var(--component-secondary-background);
		border-radius: var(--component-border-radius);
		bottom: var(--chat-controls-outer-height);
		bottom: var(--chat-controls-padding-y);
		color: var(--component-primary-color);
		font-size: var(--component-small-font);
		font-style: italic;
		left: var(--chat-controls-padding-x);
		padding: var(--chat-controls-padding-x) calc(var(--chat-controls-padding-x) * 2);
		position: fixed;
		bottom: calc(var(--chat-controls-outer-height) + var(--chat-controls-padding-x));
		opacity: .75;
	}
</style>