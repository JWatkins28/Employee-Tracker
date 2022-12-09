const inquirer = require("inquirer");
// const { database, allEmployees } = require('../config/connections');
const mysql = require('mysql2');
require('dotenv').config();
const cTable = require('console.table');


// MAKES SURE YOU CANT SUBMIT A BLANK ENTRY
const validateAnswer = (str) => {
  if (typeof str === "string") {
    str = str.replace(/\s+/g, '');
  }
  if (str == "") {
    return "Cannot be empty. Please enter a valid input";
  } else {
    return true
  }
};

// MAKES SURE YOU DON'T SUBMIT A NON-NUMBER
const validateNum = (num) => {
  var numTest = /^\d+$/;
  if (!numTest.test(num)) {
    return "Please enter only numbers. Letters or Symbols are not allowed.";
  } else {
    return true
  }
};

// Connect to database
const database = mysql.createConnection({
  host: 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: "employeetracker_db",
});
database.connect();

const mainApp = () => {
  inquirer.prompt([
    {
      type: 'list',
      name: 'mainmenu',
      message: 'What would you like to do?',
      choices: ['View All Employees', 'Add Employee', "View All Roles", "Change Employee Role", "Add A Role", "View All Departments", "Add A Department", "Exit Program", new inquirer.Separator()],
    },
  ])
    .then((answer) => {
      if (answer.mainmenu == "View All Employees") {
        allEmployees();
        return;
      } else if (answer.mainmenu == 'Add Employee') {
        addEmployee();
        return;
      } else if (answer.mainmenu == "View All Roles") {
        allRoles();
        return;
      } else if (answer.mainmenu == "Change Employee Role") {
        changeRole();
        return;
      } else if (answer.mainmenu == "Add A Role") {
        addRole();
        return;
      } else if (answer.mainmenu == "View All Departments") {
        allDepartments();
        return;
      } else if (answer.mainmenu == "Add A Department") {
        addDepartment();
        return;
      } else {
        database.end();
        return;
      }
    })
};

// ALL EMPLOYEES QUERY
const allEmployees = () => {
  database.query('SELECT e.id AS ID, concat(e.first_name," ",e.last_name) AS Employee, role.title AS Job, role.salary AS Salary, depart.department_name AS Department, concat(man.first_name," ",man.last_name) AS Manager from employeetracker_db.employee AS e LEFT JOIN employeetracker_db.employee AS man ON man.id=e.manager_id LEFT JOIN employeetracker_db.roles AS role ON e.role_id=role.id LEFT JOIN employeetracker_db.department AS depart ON depart.id=role.department_id',
    (err, res) => {
      if (err) {
        throw err;
      }
      console.table(res)
      mainApp();
    })
};

const addEmployee = () => {

  let empList = ["No Manager"]
  database.promise().query(`SELECT concat(e.first_name," ",e.last_name) AS Employee FROM employee AS e`)
    .then((emp) => {
      let e = emp[0];
      for (let i = 0; i < e.length; i++) {
        empList.push(e[i].Employee);
      }
    })

  let roleList = []
  database.promise().query(`SELECT * FROM roles`)
    .then((role) => {
      let r = role[0];
      for (let i = 0; i < r.length; i++) {
        roleList.push(r[i].title);
      }
    })

  inquirer.prompt([
    {
      type: 'input',
      name: 'first',
      message: "What is the employee's first name?",
      validate: validateAnswer,
    },
    {
      type: 'input',
      name: 'last',
      message: "What is the employee's last name?",
      validate: validateAnswer,
    },
    {
      type: 'list',
      name: 'role',
      message: "What is the employee's role?",
      choices: roleList,
    },
    {
      type: 'list',
      name: 'manager',
      message: "Who is the employee's manager?",
      choices: empList,
    }
  ])
    .then((answers) => {
      let deptID
      let mID
      database.promise().query(`SELECT role.id FROM roles AS role WHERE title = "${answers.role}"`)
        .then((d) => {
          let did = d[0];
          deptID = did[0].id
          let manager = answers.manager
          let manSplit = manager.split(" ")
          database.promise().query(`SELECT emp.id FROM employee AS emp WHERE first_name = "${manSplit[0]}" AND last_name = "${manSplit[1]}"`)
            .then((m) => {
              if (answers.manager == "No Manager") { mID = null } else { let manID = m[0]; mID = manID[0].id }
              database.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("${answers.first}", "${answers.last}", ${deptID}, ${mID})`,
                (err, res) => {
                  if (err) {
                    throw err;
                  }
                  console.log(`"${answers.first} ${answers.last}" succesfully added as an Employee`)
                  mainApp();
                })
            })


        })
    })
};

const allRoles = () => {
  database.query('SELECT role.id AS RoleID, role.title as JobTitle, role.salary as Salary, depart.department_name as Department FROM roles AS role LEFT JOIN employeetracker_db.department AS depart ON depart.id=role.department_id',
    (err, res) => {
      if (err) {
        throw err;
      }
      console.table(res)
      mainApp();
    })
};

const changeRole = () => {
  let empList = []
  let roleList = []
  database.promise().query(`SELECT concat(e.first_name," ",e.last_name) AS Employee FROM employee AS e`)
    .then((emp) => {
      let e = emp[0];
      for (let i = 0; i < e.length; i++) {
        empList.push(e[i].Employee);
      }
      database.promise().query(`SELECT * FROM roles`)
        .then((role) => {
          let r = role[0];
          for (let i = 0; i < r.length; i++) {
            roleList.push(r[i].title);
          }
          inquirer.prompt([
            {
              type: "list",
              name: "employee",
              message: "Which employee is changing roles?",
              choices: empList,
            },
            {
              type: "list",
              name: "roles",
              message: "Which role are they changing to?",
              choices: roleList,
            }
          ])
            .then((answers) => {
              let employee = answers.employee
              employee = employee.split(" ")
              database.promise().query(`SELECT emp.id FROM employee AS emp WHERE first_name = "${employee[0]}" AND last_name = "${employee[1]}"`)
                .then((e) => {
                  let empID = e[0];
                  empID = empID[0].id
                  database.promise().query(`SELECT role.id FROM roles AS role WHERE title = "${answers.roles}"`)
                    .then((r) => {
                      let rid = r[0];
                      rid = rid[0].id
                      database.promise().query(`UPDATE employee SET role_id = ${rid} WHERE id = ${empID}`)
                        .then((f) => {
                          console.log(`"${answers.employee}" role is succesfully changed to ${answers.roles}`)
                          mainApp();
                        })
                    })
                })
            })
        })
    })
};

const addRole = async () => {
  let departList = []
  database.promise().query(`SELECT * FROM department`)
    .then((depart) => {
      let d = depart[0];
      for (let i = 0; i < d.length; i++) {
        departList.push(d[i].department_name);
      }
    })
  inquirer.prompt([
    {
      type: "input",
      name: "roleName",
      message: "What is the name of the new role?",
      validate: validateAnswer,
    },
    {
      type: "input",
      name: "salary",
      message: "What is the salary of the role?",
      validate: validateNum,
    },
    {
      type: "list",
      name: "department",
      message: "Which department does this role belong to?",
      choices: departList,
    }
  ])
    .then((answers) => {
      let departID
      database.promise().query(`SELECT depart.id FROM Department AS depart WHERE department_name = "${answers.department}"`)
        .then((depart) => {
          let id = depart[0];
          departID = id[0].id
          database.query(`INSERT INTO roles (title, salary, department_id) VALUES ("${answers.roleName}", "${answers.salary}", ${departID})`,
            (err, res) => {
              if (err) {
                throw err;
              }
              console.log(`"${answers.roleName}" succesfully added as a Job Role`)
              mainApp();
            })
        })
    })
};

const allDepartments = () => {
  database.query('SELECT depart.id as ID, depart.department_name AS Department from department AS depart',
    (err, res) => {
      if (err) {
        throw err;
      }
      console.table(res)
      mainApp();
    })
};

const addDepartment = () => {
  inquirer.prompt([
    {
      type: "input",
      name: "department",
      message: "What is the name of the department?",
      validate: validateAnswer,
    }
  ])
    .then((answers) => {
      database.query('INSERT INTO department (department_name) VALUES (?)', answers.department,
        (err, res) => {
          if (err) {
            throw err;
          }
          console.log(`${answers.department} succesfully added as a Department`)
          mainApp();
        })
    })
};

module.exports = { mainApp };