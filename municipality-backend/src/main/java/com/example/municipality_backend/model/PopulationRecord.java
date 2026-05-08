package com.example.municipality_backend.model;

public class PopulationRecord {
    private int year;

    private int total;     // kokonaisväestö
    private int age0_17;   // 0-17-vuotiaat
    private int age18_64;  // 18-64-vuotiaat
    private int age65plus; // yli 65-vuotiaat

    public PopulationRecord(int year) {
        this.year = year;
    }

    public int getYear() { return year; }
    
    public void setTotal(int total) { this.total = total; }
    public void setAge0_17(int value) { this.age0_17 = value; }
    public void setAge18_64(int value) { this.age18_64 = value; }
    public void setAge65plus(int value) { this.age65plus = value; }

    public int getTotal() { return total; }
    public int getAge0_17() { return age0_17; }
    public int getAge18_64() { return age18_64; }
    public int getAge65plus() { return age65plus; }
}