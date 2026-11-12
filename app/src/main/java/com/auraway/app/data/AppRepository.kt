package com.auraway.app.data

import com.auraway.app.model.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import java.util.UUID

object AppRepository {

    // Current active role
    private val _currentRole = MutableStateFlow(UserRole.WELCOME)
    val currentRole: StateFlow<UserRole> = _currentRole.asStateFlow()

    // Students list
    private val _students = MutableStateFlow(
        listOf(
            StudentProfile(id = "s1", name = "Alex Rivers", avatarEmoji = "🎓", consistencyRate = 92, isRoutineVisibleToTeacher = true),
            StudentProfile(id = "s2", name = "Maya Lin", avatarEmoji = "🚀", consistencyRate = 88, isRoutineVisibleToTeacher = false),
            StudentProfile(id = "s3", name = "Jordan Vance", avatarEmoji = "🎨", consistencyRate = 74, isRoutineVisibleToTeacher = true)
        )
    )
    val students: StateFlow<List<StudentProfile>> = _students.asStateFlow()

    // Currently selected student
    private val _activeStudentId = MutableStateFlow("s1")
    val activeStudentId: StateFlow<String> = _activeStudentId.asStateFlow()

    // Routine Items for Active Student
    private val _routineItems = MutableStateFlow(
        listOf(
            RoutineItem(id = "r1", title = "Morning Yoga & Meditation", timeSlot = "07:00 AM - 07:30 AM", category = "Wellness", status = RoutineStatus.COMPLETED),
            RoutineItem(id = "r2", title = "Math Problem Set Review", timeSlot = "09:00 AM - 10:30 AM", category = "Study", status = RoutineStatus.COMPLETED),
            RoutineItem(id = "r3", title = "Physics Chapter 4 Summary", timeSlot = "02:00 PM - 03:30 PM", category = "Study", status = RoutineStatus.PENDING),
            RoutineItem(id = "r4", title = "Evening Walk & Water Goal", timeSlot = "06:00 PM - 06:45 PM", category = "Fitness", status = RoutineStatus.PENDING)
        )
    )
    val routineItems: StateFlow<List<RoutineItem>> = _routineItems.asStateFlow()

    // Assigned Tasks
    private val _assignedTasks = MutableStateFlow(
        listOf(
            AssignedTask(
                id = "t1",
                title = "Calculus Derivatives Practice Sheet",
                subject = "Mathematics",
                dueDate = "Today, 5:00 PM",
                instructions = "Complete exercises 1 to 15 on page 142. Show all step-by-step working.",
                assignedToStudentId = null,
                status = TaskStatus.PENDING
            ),
            AssignedTask(
                id = "t2",
                title = "Physics Lab Report: Optics & Light",
                subject = "Physics",
                dueDate = "Tomorrow, 11:59 PM",
                instructions = "Write up experimental observations and error analysis based on Monday's lab.",
                assignedToStudentId = "s1",
                status = TaskStatus.REASON_SUBMITTED,
                reasonSubmission = ReasonSubmission(
                    submittedBy = SubmitterType.PARENT,
                    reasonTag = ReasonTag.UNWELL,
                    note = "Alex had a fever last night and was advised to rest. Requesting a 1-day extension."
                )
            ),
            AssignedTask(
                id = "t3",
                title = "English Essay: Character Analysis",
                subject = "English Literature",
                dueDate = "Friday, 3:00 PM",
                instructions = "Submit 800-word essay evaluating main character motivations in Act 3.",
                assignedToStudentId = null,
                status = TaskStatus.DONE
            )
        )
    )
    val assignedTasks: StateFlow<List<AssignedTask>> = _assignedTasks.asStateFlow()

    // Wellness Data
    private val _wellnessData = MutableStateFlow(WellnessData())
    val wellnessData: StateFlow<WellnessData> = _wellnessData.asStateFlow()

    // Pomodoro State
    private val _pomodoroState = MutableStateFlow(PomodoroState())
    val pomodoroState: StateFlow<PomodoroState> = _pomodoroState.asStateFlow()

    // Actions
    fun selectRole(role: UserRole) {
        _currentRole.value = role
    }

    fun selectActiveStudent(studentId: String) {
        _activeStudentId.value = studentId
    }

    fun setRoutineVisibilityToTeacher(visible: Boolean) {
        val currentId = _activeStudentId.value
        _students.update { list ->
            list.map { student ->
                if (student.id == currentId) student.copy(isRoutineVisibleToTeacher = visible) else student
            }
        }
    }

    fun updateRoutineStatus(itemId: String, newStatus: RoutineStatus) {
        _routineItems.update { list ->
            list.map { item ->
                if (item.id == itemId) item.copy(status = newStatus) else item
            }
        }
        recalculateConsistency()
    }

    fun addRoutineItem(title: String, timeSlot: String, category: String) {
        val newItem = RoutineItem(
            id = UUID.randomUUID().toString(),
            title = title,
            timeSlot = timeSlot,
            category = category,
            status = RoutineStatus.PENDING
        )
        _routineItems.update { it + newItem }
        recalculateConsistency()
    }

    fun deleteRoutineItem(itemId: String) {
        _routineItems.update { list -> list.filterNot { it.id == itemId } }
        recalculateConsistency()
    }

    private fun recalculateConsistency() {
        val items = _routineItems.value
        if (items.isEmpty()) return
        val completedCount = items.count { it.status == RoutineStatus.COMPLETED }
        val newRate = ((completedCount.toFloat() / items.size.toFloat()) * 100).toInt()
        val currentId = _activeStudentId.value
        _students.update { list ->
            list.map { if (it.id == currentId) it.copy(consistencyRate = newRate) else it }
        }
    }

    fun markTaskAsDone(taskId: String) {
        _assignedTasks.update { list ->
            list.map { if (it.id == taskId) it.copy(status = TaskStatus.DONE) else it }
        }
    }

    fun submitTaskReason(taskId: String, submission: ReasonSubmission) {
        _assignedTasks.update { list ->
            list.map {
                if (it.id == taskId) {
                    it.copy(status = TaskStatus.REASON_SUBMITTED, reasonSubmission = submission)
                } else it
            }
        }
    }

    fun verifyOrExcuseTask(taskId: String) {
        _assignedTasks.update { list ->
            list.map {
                if (it.id == taskId) it.copy(status = TaskStatus.EXCUSED) else it
            }
        }
    }

    fun extendTaskDeadline(taskId: String, newDueDate: String) {
        _assignedTasks.update { list ->
            list.map {
                if (it.id == taskId) {
                    it.copy(status = TaskStatus.EXTENDED, extendedDueDate = newDueDate)
                } else it
            }
        }
    }

    fun assignNewTask(title: String, subject: String, dueDate: String, instructions: String, targetStudentId: String?) {
        val newTask = AssignedTask(
            id = UUID.randomUUID().toString(),
            title = title,
            subject = subject,
            dueDate = dueDate,
            instructions = instructions,
            assignedToStudentId = targetStudentId,
            status = TaskStatus.PENDING
        )
        _assignedTasks.update { listOf(newTask) + it }
    }

    fun incrementWater() {
        _wellnessData.update { it.copy(waterGlasses = (it.waterGlasses + 1).coerceAtMost(12)) }
    }

    fun decrementWater() {
        _wellnessData.update { it.copy(waterGlasses = (it.waterGlasses - 1).coerceAtLeast(0)) }
    }

    fun setMood(mood: String, note: String = "") {
        _wellnessData.update { it.copy(selectedMood = mood, moodNotes = note) }
    }

    fun updatePomodoroState(transform: (PomodoroState) -> PomodoroState) {
        _pomodoroState.update(transform)
    }
}
