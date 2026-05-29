package com.example.sampleApp.features.userRegister;

import com.example.sampleApp.features.auth.AuthResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public UserEntity createUser(@RequestBody UserEntity user) {
        return userService.saveUser(user);
    }

    @GetMapping
    public Page<UserEntity> getAllUsers(Pageable pageable) {
        return userService.getAllUsers(pageable);
    }

    @GetMapping("/{id}")
    public AuthResponse.UserResponse getUser(@PathVariable Long id) {
        UserEntity entity = userService.getUserById(id);
        return new AuthResponse.UserResponse(entity);
    }

    @DeleteMapping("/{id}")
    public String deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return "User Deleted";
    }
}
