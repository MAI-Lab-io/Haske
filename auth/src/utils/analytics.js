export const logAction = async (action, metadata = {}, currentUser) => {
  try {
    await fetch('https://haske.online:8090/api/analytics/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: currentUser?.id,
        email: currentUser?.email,
        action,
        metadata
      })
    });
  } catch (error) {
    console.error('Error logging action:', error);
  }
};
