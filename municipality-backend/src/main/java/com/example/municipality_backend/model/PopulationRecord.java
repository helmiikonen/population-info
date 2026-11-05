package com.example.municipality_backend.model;

public class PopulationRecord {
    private int year;

    private int total;     // kokonaisväestö
    private int age0_14;   // 0-14-vuotiaat
    private int age15_64;  // 15-64-vuotiaat
    private int age65plus; // yli 65-vuotiaat

    public PopulationRecord(int year) {
        this.year = year;
    }

    public int getYear() { return year; }
    
    public void setTotal(int total) { this.total = total; }
    public void setAge0_14(int value) { this.age0_14 = value; }
    public void setAge15_64(int value) { this.age15_64 = value; }
    public void setAge65plus(int value) { this.age65plus = value; }

    public int getTotal() { return total; }
    public int getAge0_14() { return age0_14; }
    public int getAge15_64() { return age15_64; }
    public int getAge65plus() { return age65plus; }
}