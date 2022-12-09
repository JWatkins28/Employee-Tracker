-- SAMPLE DATA TO BE ADDED TO THE DB IF SAMPLE DATA IS WANTED
INSERT INTO department (id, department_name)
VALUES (001, "Accounting"),
       (002, "Marketing");

INSERT INTO roles (id, title, salary, department_id)
VALUES (001, "CFO", "175000", 001),
       (002, "Sr Accountant", "85000", 001),
       (003, "CMO", "135000", 002),
       (004, "Sr Marketing Analyst", "90000", 002);

INSERT INTO employee (id, first_name, last_name, role_id, manager_id)
VALUES (001, "Justin", "Watkins", 001, null),
       (002, "Mantis", "Watkins", 002, 001);