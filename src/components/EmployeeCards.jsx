import React from "react";

const EmployeeCards = () => {
  const employees = [
    {
      img: "https://randomuser.me/api/portraits/men/32.jpg",
      name: "Sam David",
      position: "UI Designer",
      month: "85%",
      year: "87%",
    },
    {
      img: "https://randomuser.me/api/portraits/women/44.jpg",
      name: "Balbina Kherr",
      position: "Programmer",
      month: "82%",
      year: "85%",
    },
    {
      img: "https://randomuser.me/api/portraits/men/46.jpg",
      name: "Badan John",
      position: "Tester",
      month: "94%",
      year: "92%",
    },
    {
      img: "https://randomuser.me/api/portraits/women/68.jpg",
      name: "Salina Micheal",
      position: "UI Designer",
      month: "85%",
      year: "82%",
    },
  ];

  return (
    <div className="users">
      {employees.map((employee, index) => (
        <div className="card" key={index}>
          <img src={employee.img} alt={employee.name} />
          <h4>{employee.name}</h4>
          <p>{employee.position}</p>
          <div className="per">
            <table>
              <tr>
                <td>
                  <span>{employee.month}</span>
                </td>
                <td>
                  <span>{employee.year}</span>
                </td>
              </tr>
              <tr>
                <td>Month</td>
                <td>Year</td>
              </tr>
            </table>
          </div>
          <button>Profile</button>
        </div>
      ))}
    </div>
  );
};

export default EmployeeCards;
