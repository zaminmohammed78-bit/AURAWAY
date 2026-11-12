package com.auraway.app.ui.student

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Assignment
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.HelpOutline
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.auraway.app.model.AssignedTask
import com.auraway.app.model.ReasonSubmission
import com.auraway.app.model.TaskStatus
import com.auraway.app.ui.theme.ErrorRed
import com.auraway.app.ui.theme.StudentPrimary
import com.auraway.app.ui.theme.SuccessGreen
import com.auraway.app.ui.theme.WarningOrange

@Composable
fun StudentTasksTab(
    assignedTasks: List<AssignedTask>,
    onMarkAsDone: (String) -> Unit,
    onSubmitReason: (String, ReasonSubmission) -> Unit
) {
    var taskForReasonSubmission by remember { mutableStateOf<AssignedTask?>(null) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Assigned Homework (${assignedTasks.size})",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold
            )
        }

        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(16.dp),
            modifier = Modifier.fillMaxSize()
        ) {
            items(assignedTasks, key = { it.id }) { task ->
                StudentTaskCard(
                    task = task,
                    onMarkAsDone = { onMarkAsDone(task.id) },
                    onOpenReasonModal = { taskForReasonSubmission = task }
                )
            }
        }
    }

    // Modal popup for Reason Submission
    taskForReasonSubmission?.let { task ->
        ReasonSubmissionDialog(
            task = task,
            onDismiss = { taskForReasonSubmission = null },
            onSubmit = { submission ->
                onSubmitReason(task.id, submission)
                taskForReasonSubmission = null
            }
        )
    }
}

@Composable
private fun StudentTaskCard(
    task: AssignedTask,
    onMarkAsDone: () -> Unit,
    onOpenReasonModal: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 3.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            // Subject Tag and Status Badge
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = StudentPrimary.copy(alpha = 0.15f)
                ) {
                    Text(
                        text = task.subject,
                        style = MaterialTheme.typography.labelMedium,
                        color = StudentPrimary,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                    )
                }

                StatusBadge(status = task.status)
            }

            // Task Title & Instructions
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(
                    text = task.title,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = task.instructions,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            // Due Date Row
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Schedule,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.size(16.dp)
                )
                Text(
                    text = "Due: ${task.extendedDueDate ?: task.dueDate}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    fontWeight = FontWeight.Medium
                )
            }

            // If a reason was submitted, show reason preview box
            if (task.status == TaskStatus.REASON_SUBMITTED && task.reasonSubmission != null) {
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = WarningOrange.copy(alpha = 0.1f),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(12.dp),
                        verticalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Text(
                            text = "📌 Reason Submitted (${task.reasonSubmission.submittedBy.name})",
                            style = MaterialTheme.typography.labelSmall,
                            color = WarningOrange,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "\"${task.reasonSubmission.note}\"",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    }
                }
            }

            Divider(color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f))

            // Action Buttons
            if (task.status == TaskStatus.PENDING || task.status == TaskStatus.REASON_SUBMITTED) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    // Mark as Done Button
                    Button(
                        onClick = onMarkAsDone,
                        modifier = Modifier.weight(1f),
                        colors = ButtonDefaults.buttonColors(containerColor = SuccessGreen),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.CheckCircle,
                            contentDescription = null,
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Mark as Done", fontSize = 13.sp)
                    }

                    // Couldn't Complete / Submit Reason Button
                    OutlinedButton(
                        onClick = onOpenReasonModal,
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = ErrorRed)
                    ) {
                        Icon(
                            imageVector = Icons.Default.HelpOutline,
                            contentDescription = null,
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Submit Reason", fontSize = 13.sp)
                    }
                }
            } else {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Info,
                        contentDescription = null,
                        tint = SuccessGreen,
                        modifier = Modifier.size(18.dp)
                    )
                    Text(
                        text = when (task.status) {
                            TaskStatus.DONE -> "Completed successfully"
                            TaskStatus.EXCUSED -> "Verified & Excused by Teacher"
                            TaskStatus.EXTENDED -> "Deadline extended by Teacher"
                            else -> ""
                        },
                        style = MaterialTheme.typography.labelLarge,
                        color = SuccessGreen
                    )
                }
            }
        }
    }
}

@Composable
fun StatusBadge(status: TaskStatus) {
    val (label, bg, fg) = when (status) {
        TaskStatus.PENDING -> Triple("Pending", MaterialTheme.colorScheme.surfaceVariant, MaterialTheme.colorScheme.onSurfaceVariant)
        TaskStatus.DONE -> Triple("Completed ✓", SuccessGreen.copy(alpha = 0.15f), SuccessGreen)
        TaskStatus.REASON_SUBMITTED -> Triple("Reason Submitted", WarningOrange.copy(alpha = 0.15f), WarningOrange)
        TaskStatus.EXCUSED -> Triple("Excused ✓", SuccessGreen.copy(alpha = 0.15f), SuccessGreen)
        TaskStatus.EXTENDED -> Triple("Extended ⏱️", StudentPrimary.copy(alpha = 0.15f), StudentPrimary)
    }

    Surface(
        shape = RoundedCornerShape(8.dp),
        color = bg
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.labelSmall,
            color = fg,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
        )
    }
}
