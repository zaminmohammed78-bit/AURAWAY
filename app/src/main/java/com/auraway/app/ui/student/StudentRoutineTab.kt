package com.auraway.app.ui.student

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.auraway.app.model.RoutineItem
import com.auraway.app.model.RoutineStatus
import com.auraway.app.ui.theme.ErrorRed
import com.auraway.app.ui.theme.StudentPrimary
import com.auraway.app.ui.theme.SuccessGreen

@Composable
fun StudentRoutineTab(
    isRoutineVisibleToTeacher: Boolean,
    routineItems: List<RoutineItem>,
    onToggleVisibility: (Boolean) -> Unit,
    onUpdateStatus: (String, RoutineStatus) -> Unit,
    onAddRoutineItem: (String, String, String) -> Unit,
    onDeleteRoutineItem: (String) -> Unit
) {
    var showAddDialog by remember { mutableStateOf(false) }

    Scaffold(
        floatingActionButton = {
            FloatingActionButton(
                onClick = { showAddDialog = true },
                containerColor = StudentPrimary,
                contentColor = Color.White,
                shape = CircleShape
            ) {
                Icon(imageVector = Icons.Default.Add, contentDescription = "Add Routine Item")
            }
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Prominent Privacy Toggle Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(
                    containerColor = if (isRoutineVisibleToTeacher) StudentPrimary.copy(alpha = 0.1f) else MaterialTheme.colorScheme.surfaceVariant
                ),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(12.dp),
                        modifier = Modifier.weight(1f)
                    ) {
                        Surface(
                            shape = CircleShape,
                            color = if (isRoutineVisibleToTeacher) StudentPrimary else Color.Gray,
                            modifier = Modifier.size(40.dp)
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Icon(
                                    imageVector = if (isRoutineVisibleToTeacher) Icons.Default.Visibility else Icons.Default.Lock,
                                    contentDescription = null,
                                    tint = Color.White,
                                    modifier = Modifier.size(20.dp)
                                )
                            }
                        }
                        Column {
                            Text(
                                text = "Visible to Teacher",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = if (isRoutineVisibleToTeacher)
                                    "Your teacher can view your active routine"
                                else
                                    "Private mode: Routine is hidden from teacher",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }

                    Switch(
                        checked = isRoutineVisibleToTeacher,
                        onCheckedChange = onToggleVisibility,
                        colors = SwitchDefaults.colors(
                            checkedThumbColor = Color.White,
                            checkedTrackColor = StudentPrimary
                        )
                    )
                }
            }

            Text(
                text = "Daily Time Blocks (${routineItems.size})",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold
            )

            // Routine Items List
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(12.dp),
                modifier = Modifier.fillMaxSize()
            ) {
                items(routineItems, key = { it.id }) { item ->
                    RoutineItemCard(
                        item = item,
                        onUpdateStatus = { status -> onUpdateStatus(item.id, status) },
                        onDelete = { onDeleteRoutineItem(item.id) }
                    )
                }
            }
        }
    }

    // Add Routine Item Modal Dialog
    if (showAddDialog) {
        AddRoutineDialog(
            onDismiss = { showAddDialog = false },
            onAdd = { title, timeSlot, category ->
                onAddRoutineItem(title, timeSlot, category)
                showAddDialog = false
            }
        )
    }
}

@Composable
private fun RoutineItemCard(
    item: RoutineItem,
    onUpdateStatus: (RoutineStatus) -> Unit,
    onDelete: () -> Unit
) {
    val cardBg = when (item.status) {
        RoutineStatus.COMPLETED -> SuccessGreen.copy(alpha = 0.08f)
        RoutineStatus.MISSED -> ErrorRed.copy(alpha = 0.08f)
        RoutineStatus.PENDING -> MaterialTheme.colorScheme.surface
    }

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(containerColor = cardBg),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Text(
                        text = item.category,
                        style = MaterialTheme.typography.labelSmall,
                        color = StudentPrimary,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier
                            .background(
                                StudentPrimary.copy(alpha = 0.15f),
                                RoundedCornerShape(6.dp)
                            )
                            .padding(horizontal = 8.dp, vertical = 2.dp)
                    )
                    Text(
                        text = item.timeSlot,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = item.title,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold
                )
            }

            // Green Tick (✓) and Red Cross (✕) Action Buttons
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                // Green Tick (✓) Button
                IconButton(
                    onClick = {
                        val nextStatus = if (item.status == RoutineStatus.COMPLETED) RoutineStatus.PENDING else RoutineStatus.COMPLETED
                        onUpdateStatus(nextStatus)
                    },
                    modifier = Modifier
                        .size(40.dp)
                        .background(
                            color = if (item.status == RoutineStatus.COMPLETED) SuccessGreen else SuccessGreen.copy(alpha = 0.15f),
                            shape = CircleShape
                        )
                ) {
                    Icon(
                        imageVector = Icons.Default.Check,
                        contentDescription = "Mark Completed",
                        tint = if (item.status == RoutineStatus.COMPLETED) Color.White else SuccessGreen
                    )
                }

                // Red Cross (✕) Button
                IconButton(
                    onClick = {
                        val nextStatus = if (item.status == RoutineStatus.MISSED) RoutineStatus.PENDING else RoutineStatus.MISSED
                        onUpdateStatus(nextStatus)
                    },
                    modifier = Modifier
                        .size(40.dp)
                        .background(
                            color = if (item.status == RoutineStatus.MISSED) ErrorRed else ErrorRed.copy(alpha = 0.15f),
                            shape = CircleShape
                        )
                ) {
                    Icon(
                        imageVector = Icons.Default.Close,
                        contentDescription = "Mark Missed",
                        tint = if (item.status == RoutineStatus.MISSED) Color.White else ErrorRed
                    )
                }

                // Delete Icon Button
                IconButton(
                    onClick = onDelete,
                    modifier = Modifier.size(32.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Delete,
                        contentDescription = "Delete item",
                        tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.6f),
                        modifier = Modifier.size(18.dp)
                    )
                }
            }
        }
    }
}

@Composable
private fun AddRoutineDialog(
    onDismiss: () -> Unit,
    onAdd: (title: String, timeSlot: String, category: String) -> Unit
) {
    var title by remember { mutableStateOf("") }
    var timeSlot by remember { mutableStateOf("04:00 PM - 05:00 PM") }
    var category by remember { mutableStateOf("Study") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Add Routine Time Block", fontWeight = FontWeight.Bold) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                OutlinedTextField(
                    value = title,
                    onValueChange = { title = it },
                    label = { Text("Routine Task Name") },
                    placeholder = { Text("e.g. Chemistry Revision") },
                    singleLine = true,
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.fillMaxWidth()
                )
                OutlinedTextField(
                    value = timeSlot,
                    onValueChange = { timeSlot = it },
                    label = { Text("Time Block Slot") },
                    singleLine = true,
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.fillMaxWidth()
                )
                OutlinedTextField(
                    value = category,
                    onValueChange = { category = it },
                    label = { Text("Category (e.g. Study, Fitness, Wellness)") },
                    singleLine = true,
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.fillMaxWidth()
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    if (title.isNotBlank()) {
                        onAdd(title, timeSlot, category)
                    }
                },
                colors = ButtonDefaults.buttonColors(containerColor = StudentPrimary),
                shape = RoundedCornerShape(12.dp)
            ) {
                Text("Add Task")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}
