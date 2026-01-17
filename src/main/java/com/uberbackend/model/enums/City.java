package com.uberbackend.model.enums;

import lombok.Getter;

@Getter
public enum City {
    BANGALORE(1, "Bangalore"),
    CHENNAI(2, "Chennai"),
    DELHI(3, "Delhi"),
    HYDERABAD(4, "Hyderabad"),
    KOLKATA(5, "Kolkata"),
    MUMBAI(6, "Mumbai"),
    PUNE(7, "Pune");

    int id;
    String name;

    City(int id, String name) {
        this.id = id;
        this.name = name;
    }
}
