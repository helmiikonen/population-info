package com.example.municipality_backend.model;

import java.util.List;
import java.util.ArrayList;

public class PopulationCache {
	private PopulationRecord totalPopulation;
	private List<PopulationRecord> savedMunipalicities;
	
	public PopulationCache() {
		this.savedMunipalicities = new ArrayList<>();
	}
	
	public void setTotalPopulation(PopulationRecord record) {
		this.totalPopulation = record;
	}
	
	public void addMunicipality(PopulationRecord record) {
		this.savedMunipalicities.add(record);
	}
}