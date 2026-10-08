// renderer.js

// ======================
// DOM ELEMENTS
// ======================
const assistantResponse = document.getElementById('assistantResponse');
const remindersList = document.getElementById('remindersList');
const voiceBtn = document.getElementById('voiceBtn');
const synth = window.speechSynthesis;

// ======================
// REMINDERS FUNCTIONS
// ======================

async function loadReminders() {
  try {
    return await window.electronAPI.getReminders();
  } catch (error) {
    console.error('Error loading reminders:', error);
    return [];
  }
}

async function saveReminders(reminders) {
  try {
    await window.electronAPI.saveReminders(reminders);
  } catch (error) {
    console.error('Error saving reminders:', error);
  }
}

function displayReminders(reminders) {
  remindersList.innerHTML = '';

  if (reminders.length === 0) {
    remindersList.innerHTML = `
      <li class="reminder-item text-center text-muted py-4">
        <i class="fas fa-inbox fa-2x mb-2"></i>
        <p class="mb-0">No reminders yet</p>
      </li>
    `;
    return;
  }

  reminders.forEach((reminder, index) => {
    const li = document.createElement('li');
    li.className = 'reminder-item';
    li.innerHTML = `
      <div>
        <strong>${reminder.text}</strong>
        <div class="text-muted small">
          ${new Date(reminder.timestamp).toLocaleString()}
          ${reminder.priority ? `<span class="badge ${getPriorityBadgeClass(reminder.priority)} ms-2">${reminder.priority}</span>` : ''}
        </div>
      </div>
      <button class="btn btn-sm btn-outline-danger delete-btn" data-index="${index}">
        <i class="fas fa-trash"></i>
      </button>
    `;
    remindersList.appendChild(li);
  });

  // Add event listeners to delete buttons
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', async function() {
      const reminders = await loadReminders();
      const index = parseInt(this.getAttribute('data-index'));
      reminders.splice(index, 1);
      await saveReminders(reminders);
      displayReminders(reminders);
    });
  });
}

function getPriorityBadgeClass(priority) {
  const classes = {
    high: 'bg-danger',
    medium: 'bg-warning',
    low: 'bg-success'
  };
  return classes[priority.toLowerCase()] || 'bg-secondary';
}

// ======================
// VOICE ASSISTANT FUNCTIONS
// ======================

function getRemindersMessage(reminders) {
  if (reminders.length === 0) {
    return "You have no reminders.";
  }
  return `You have ${reminders.length} reminder${reminders.length !== 1 ? 's' : ''}: ` +
    reminders.map((r, i) => `Reminder ${i + 1}: ${r.text}`).join('. ');
}

function speakMessage(message) {
  const utterance = new SpeechSynthesisUtterance(message);
  synth.speak(utterance);
}

async function startAssistant() {
  try {
    const reminders = await loadReminders();
    const message = getRemindersMessage(reminders);
    speakMessage(message);
    displayReminders(reminders);
    
    // Update UI
    assistantResponse.innerHTML = `
      <div class="alert alert-success">
        ${message}
      </div>
    `;
  } catch (error) {
    console.error('Error starting assistant:', error);
    assistantResponse.innerHTML = `
      <div class="alert alert-danger">
        Failed to start assistant: ${error.message}
      </div>
    `;
  }
}

// ======================
// INITIALIZATION
// ======================

document.addEventListener('DOMContentLoaded', async () => {
  // Wait for voices to be loaded
  if (synth.onvoiceschanged !== undefined) {
    synth.onvoiceschanged = startAssistant;
  } else {
    // Fallback if voiceschanged isn't supported
    setTimeout(startAssistant, 1000);
  }

  // Initialize voice button
  voiceBtn.addEventListener('click', startVoiceRecognition);
});

// ======================
// VOICE RECOGNITION
// ======================

function startVoiceRecognition() {
  console.log('Voice recognition started');
  // Your existing voice recognition implementation
  // Make sure to use window.electronAPI for any IPC communication
}