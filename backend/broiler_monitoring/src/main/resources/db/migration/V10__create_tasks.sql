CREATE TABLE tasks(
    id UUID PRIMARY KEY,
    nameTask VARCHAR(255) NOT NULL,
    descriptionTask TEXT NOT NULL,
    nameIndicator VARCHAR(255) NOT NULL,
    valueIndicator VARCHAR(255) NOT NULL,
    measure VARCHAR(30) NOT NULL,
    priority VARCHAR(50) NOT NULL,
    responsible VARCHAR(255) NOT NULL,
    status VARCHAR(50)  NOT NULL,
    createTask TIMESTAMP NOT NULL,
    termTask TIMESTAMP NOT NULL
);


CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_responsible ON tasks(responsible);
CREATE INDEX idx_tasks_create_task ON tasks(createTask);
CREATE INDEX idx_tasks_term_task ON tasks(termTask);
