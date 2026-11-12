package com.auraway.app.ui.student

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.auraway.app.model.AssignedTask
import com.auraway.app.model.ReasonSubmission
import com.auraway.app.model.ReasonTag
import com.auraway.app.model.SubmitterType
import com.auraway.app.ui.theme.StudentPrimary

@Composable
fun ReasonSubmissionDialog(
    task: AssignedTask,
    onDismiss: () -> Unit,
    onSubmit: (ReasonSubmission) -> Unit
) {
    var selectedSubmitter by remember { mutableStateOf(SubmitterType.STUDENT) }
    var selectedReasonTag by remember { mutableStateOf(ReasonTag.UNWELL) }
    var noteText by remember { mutableStateOf("") }

    Dialog(onDismissRequest = onDismiss) {
        Card(
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            elevation = CardDefaults.cardElevation(defaultElevation = 8.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(24.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Header
                Column {
                    Text(
                        text = "Submit Non-Completion Note",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = task.title,
                        style = MaterialTheme.typography.bodyMedium,
                        color = StudentPrimary,
                        fontWeight = FontWeight.SemiBold
                    )
                }

                Divider()

                // Submitter Selection (Student vs Parent)
                Column {
                    Text(
                        text = "Who is submitting this note?",
                        style = MaterialTheme.typography.labelLarge,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        SubmitterTypeChip(
                            label = "🧑‍🎓 Student",
                            selected = selectedSubmitter == SubmitterType.STUDENT,
                            onClick = { selectedSubmitter = SubmitterType.STUDENT },
                            modifier = Modifier.weight(1f)
                        )
                        SubmitterTypeChip(
                            label = "👨‍👩‍👦 Parent / Guardian",
                            selected = selectedSubmitter == SubmitterType.PARENT,
                            onClick = { selectedSubmitter = SubmitterType.PARENT },
                            modifier = Modifier.weight(1f)
                        )
                    }
                }

                // Reason Tag Selection
                Column {
                    Text(
                        text = "Reason Category",
                        style = MaterialTheme.typography.labelLarge,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        ReasonTag.values().forEach { tag ->
                            val isSelected = selectedReasonTag == tag
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clickable { selectedReasonTag = tag }
                                    .background(
                                        color = if (isSelected) StudentPrimary.copy(alpha = 0.15f) else Color.Transparent,
                                        shape = RoundedCornerShape(10.dp)
                                    )
                                    .padding(horizontal = 12.dp, vertical = 8.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                RadioButton(
                                    selected = isSelected,
                                    onClick = { selectedReasonTag = tag },
                                    colors = RadioButtonDefaults.colors(selectedColor = StudentPrimary)
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = tag.label,
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                            }
                        }
                    }
                }

                // Additional Explanation Note
                Column {
                    Text(
                        text = "Short Explanation Note",
                        style = MaterialTheme.typography.labelLarge,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedTextField(
                        value = noteText,
                        onValueChange = { noteText = it },
                        placeholder = { Text("Enter details for your teacher...") },
                        modifier = Modifier.fillMaxWidth(),
                        maxLines = 3,
                        shape = RoundedCornerShape(12.dp)
                    )
                }

                // Action Buttons
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.End,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    TextButton(onClick = onDismiss) {
                        Text("Cancel")
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Button(
                        onClick = {
                            val submission = ReasonSubmission(
                                submittedBy = selectedSubmitter,
                                reasonTag = selectedReasonTag,
                                note = noteText.ifBlank { selectedReasonTag.label }
                            )
                            onSubmit(submission)
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = StudentPrimary),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text("Submit Note")
                    }
                }
            }
        }
    }
}

@Composable
private fun SubmitterTypeChip(
    label: String,
    selected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Surface(
        selected = selected,
        onClick = onClick,
        shape = RoundedCornerShape(12.dp),
        color = if (selected) StudentPrimary else MaterialTheme.colorScheme.surfaceVariant,
        contentColor = if (selected) Color.White else MaterialTheme.colorScheme.onSurfaceVariant,
        modifier = modifier.height(44.dp)
    ) {
        Box(contentAlignment = Alignment.Center, modifier = Modifier.fillMaxSize()) {
            Text(
                text = label,
                style = MaterialTheme.typography.labelLarge,
                fontSize = 13.sp
            )
        }
    }
}
