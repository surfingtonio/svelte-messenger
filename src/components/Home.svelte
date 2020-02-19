<script>
  export let user;
  export let usersCount = 0;
</script>

<style>
  .home {
    background: #efefef;
    display: grid;
    grid-template-rows: minmax(0, 100vh);
    height: 100vh;
  }

  .home .welcome {
    align-items: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .home .welcome p {
    color: #777;
    font-size: 1rem;
    margin: 0 0 0.5rem;
  }

  .home .welcome .greeting {
    font-size: 1.75rem;
    font-weight: 700;
    text-shadow: 2px 1px #ddd;
  }
</style>

<div class="home">
  <div class="welcome">
    <p class="greeting">
      Hi
      <span>{user.first} {user.last}</span>
    </p>
    {#if usersCount > 0}
      <p>Select a user on the left to start chatting.</p>
    {:else}
      <p>There are no online users at the moment.</p>
    {/if}
  </div>
</div>
