package com.auraway.app.model

enum class PomodoroMode(val durationSeconds: Int, val label: String) {
    FOCUS(25 * 60, "Study Focus (25m)"),
    SHORT_BREAK(5 * 60, "Short Break (5m)"),
    LONG_BREAK(15 * 60, "Long Break (15m)")
}

data class PomodoroState(
    val mode: PomodoroMode = PomodoroMode.FOCUS,
    val secondsRemaining: Int = PomodoroMode.FOCUS.durationSeconds,
    val isRunning: Boolean = false,
    val completedSessions: Int = 3
)
