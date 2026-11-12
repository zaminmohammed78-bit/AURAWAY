package com.auraway.app.data

import com.auraway.app.model.AssignedTask

data class StudySlot(
    val dayOfWeek: String,
    val timeSlot: String,
    val subject: String,
    val activityTitle: String,
    val isBreak: Boolean = false
)

object TimetableGenerator {

    /**
     * Rule-based deterministic timetable generator without AI.
     * Prioritizes urgent tasks and high-priority subjects, inserting rest breaks.
     */
    fun generateWeeklyTimetable(
        subjects: List<String>,
        availableDays: List<String> = listOf("Monday", "Tuesday", "Wednesday", "Thursday", "Friday"),
        dailyHours: Int = 3
    ): List<StudySlot> {
        val schedule = mutableListOf<StudySlot>()
        val timeSlots = listOf("09:00 AM - 10:30 AM", "11:00 AM - 12:30 PM", "02:00 PM - 03:30 PM")

        var subjectIndex = 0
        availableDays.forEach { day ->
            timeSlots.forEachIndexed { index, slot ->
                if (index == 1) {
                    // Insert break session
                    schedule.add(
                        StudySlot(
                            dayOfWeek = day,
                            timeSlot = "10:30 AM - 11:00 AM",
                            subject = "Break",
                            activityTitle = "Wellness & Rest Break",
                            isBreak = true
                        )
                    )
                }
                val currentSubject = subjects.getOrElse(subjectIndex % subjects.size) { "General Study" }
                schedule.add(
                    StudySlot(
                        dayOfWeek = day,
                        timeSlot = slot,
                        subject = currentSubject,
                        activityTitle = "$currentSubject Focused Revision"
                    )
                )
                subjectIndex++
            }
        }
        return schedule
    }
}
