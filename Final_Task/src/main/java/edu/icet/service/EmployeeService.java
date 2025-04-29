package edu.icet.service;

import com.fortium.employeedirectory.exception.ResourceNotFoundException;
import com.fortium.employeedirectory.exception.ValidationException;
import com.fortium.employeedirectory.model.Employee;
import com.fortium.employeedirectory.repository.EmployeeRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

import java.util.List;

@Service
@Validated
public class EmployeeService {

    private final EmployeeRepository employeeRepository;

    @Autowired
    public EmployeeService(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    public Employee getEmployeeById(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));
    }

    public Employee createEmployee(@Valid Employee employee) {
        if (employeeRepository.existsByEmail(employee.getEmail())) {
            throw new ValidationException("Email already exists: " + employee.getEmail());
        }
        return employeeRepository.save(employee);
    }

    public Employee updateEmployee(Long id, @Valid Employee employeeDetails) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));

        if (employeeRepository.existsByEmailAndIdNot(employeeDetails.getEmail(), id)) {
            throw new ValidationException("Email already exists: " + employeeDetails.getEmail());
        }

        employee.setName(employeeDetails.getName());
        employee.setEmail(employeeDetails.getEmail());
        employee.setDepartment(employeeDetails.getDepartment());

        return employeeRepository.save(employee);
    }

    public void deleteEmployee(Long id) {
        if (!employeeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Employee not found with id: " + id);
        }
        employeeRepository.deleteById(id);
    }
}