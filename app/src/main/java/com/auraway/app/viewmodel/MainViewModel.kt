package com.auraway.app.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.auraway.app.data.AppRepository
import com.auraway.app.model.*
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class MainViewModel : ViewModel() {

    val currentRole: StateFlow<UserRole> = AppRepository.currentRole
    val students: StateFlow<List<StudentProfile>> = AppRepository.students
    val activeStudentId: StateFlow<String> = AppRepository.activeStudentId
    val routineItems: StateFlow<List<RoutineItem>> = AppRepository.routineItems
    val assignedTasks: StateFlow<List<AssignedTask>> = AppRepository.assignedTasks
    val wellnessData: StateFlow<WellnessData> = AppRepository.wellnessData
    val pomodoroState: StateFlow<PomodoroState> = AppRepository.pomodoroState

    private var pomodoroJob: Job? = null

    fun selectRole(role: UserRole) {
        AppRepository.selectRole(role)
    }

    fun selectActiveStudent(studentId: String) {
        AppRepository.selectActiveStudent(studentId)
    }

    fun toggleRoutineVisibility(visible: Boolean) {
        AppRepository.setRoutineVisibilityToTeacher(visible)
    }

    fun markRoutineItemStatus(itemId: String, status: RoutineStatus) {
        AppRepository.updateRoutineStatus(itemId, status)
    }

    fun addRoutineItem(title: String, timeSlot: String, category: String) {
        AppRepository.addRoutineItem(title, timeSlot, category)
    }

    fun deleteRoutineItem(itemId: String) {
        AppRepository.deleteRoutineItem(itemId)
    }

    fun markTaskAsDone(taskId: String) {
        AppRepository.markTaskAsDone(taskId)
    }

    fun submitTaskReason(taskId: String, submission: ReasonSubmission) {
        AppRepository.submitTaskReason(taskId, submission)
    }

    fun verifyOrExcuseTask(taskId: String) {
        AppRepository.verifyOrExcuseTask(taskId)
    }

    fun extendTaskDeadline(taskId: String, newDueDate: String) {
        AppRepository.extendTaskDeadline(taskId, newDueDate)
    }

    fun assignNewTask(title: String, subject: String, dueDate: String, instructions: String, targetStudentId: String?) {
        AppRepository.assignNewTask(title, subject, dueDate, instructions, targetStudentId)
    }

    fun incrementWater() {
        AppRepository.incrementWater()
    }

    fun decrementWater() {
        AppRepository.decrementWater()
    }

    fun setMood(mood: String, note: String = "") {
        AppRepository.setMood(mood, note)
    }

    // Pomodoro Timer Controls
    fun startPomodoroTimer() {
        if (pomodoroState.value.isRunning) return
        AppRepository.updatePomodoroState { it.copy(isRunning = true) }

        pomodoroJob?.cancel()
        pomodoroJob = viewModelScope.launch {
            while (pomodoroState.value.isRunning && pomodoroState.value.secondsRemaining > 0) {
                delay(1000L)
                AppRepository.updatePomodoroState { current ->
                    if (current.secondsRemaining > 1) {
                        current.copy(secondsRemaining = current.secondsRemaining - 1)
                    } else {
                        // Switch mode or complete session
                        val nextMode = if (current.mode == PomodoroMode.FOCUS) PomodoroMode.SHORT_BREAK else PomodoroMode.FOCUS
                        val completedCount = if (current.mode == PomodoroMode.FOCUS) current.completedSessions + 1 else current.completedSessions
                        current.copy(
                            mode = nextMode,
                            secondsRemaining = nextMode.durationSeconds,
                            isRunning = false,
                            completedSessions = completedCount
                        )
                    }
                }
            }
        }
    }

    fun pausePomodoroTimer() {
        pomodoroJob?.cancel()
        AppRepository.updatePomodoroState { it.copy(isRunning = false) }
    }

    fun resetPomodoroTimer() {
        pomodoroJob?.cancel()
        val currentMode = pomodoroState.value.mode
        AppRepository.updatePomodoroState {
            it.copy(
                secondsRemaining = currentMode.durationSeconds,
                isRunning = false
            )
        }
    }

    fun switchPomodoroMode(mode: PomodoroMode) {
        pomodoroJob?.cancel()
        AppRepository.updatePomodoroState {
            it.copy(
                mode = mode,
                secondsRemaining = mode.durationSeconds,
                isRunning = false
            )
        }
    }
}
