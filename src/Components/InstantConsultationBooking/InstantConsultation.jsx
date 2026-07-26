import React, { useEffect, useState } from 'react';
import './InstantConsultation.css';
import { useNavigate, useSearchParams } from 'react-router-dom';
import FindDoctorSearchIC from './FindDoctorSearchIC/FindDoctorSearchIC';
import DoctorCardIC from './DoctorCardIC/DoctorCardIC';

const InstantConsultation = () => {
    const [searchParams] = useSearchParams();
    const [doctors, setDoctors] = useState([]);
    const [filteredDoctors, setFilteredDoctors] = useState([]);
    const [isSearched, setIsSearched] = useState(false);
    
    const getDoctorsDetails = () => {
        fetch('https://api.npoint.io/9a5543d36f1460da2f63')
        .then(res => res.json())
        .then(data => {
            setDoctors(data);
            const speciality = searchParams.get('speciality');
            if (speciality) {
                const filtered = data.filter(doctor => 
                    doctor.speciality.toLowerCase() === speciality.toLowerCase()
                );
                setFilteredDoctors(filtered);
                setIsSearched(true);
            } else {
                setFilteredDoctors([]);
                setIsSearched(false);
            }
        })
        .catch(err => console.log(err));
    }
    const handleSearch = (searchText) => {
        if (searchText === '') {
            setFilteredDoctors([]);
            setIsSearched(false);
        } else {
            const filtered = doctors.filter(
                (doctor) =>
                doctor.speciality.toLowerCase().includes(searchText.toLowerCase())
            );
            setFilteredDoctors(filtered);
            setIsSearched(true);
        }
    };
    const navigate = useNavigate();
    useEffect(() => {
        getDoctorsDetails();
    }, [])

    useEffect(() => {
        const speciality = searchParams.get('speciality');
        if (speciality && doctors.length > 0) {
            const filtered = doctors.filter(doctor => 
                doctor.speciality.toLowerCase().includes(speciality.toLowerCase())
            );
            setFilteredDoctors(filtered);
            setIsSearched(true);
        } else {
            setFilteredDoctors([]);
            setIsSearched(false);
        }
    }, [searchParams, doctors])

    return (
        <center>
            <div  className="searchpage-container">
            <FindDoctorSearchIC onSearch={handleSearch} />
            <div className="search-results-container">
            {isSearched ? (
                <center>
                    <h2>{filteredDoctors.length} doctors are available {searchParams.get('location')}</h2>
                    <h3>Book appointments with minimum wait-time & verified doctor details</h3>
                    {filteredDoctors.length > 0 ? (
                    filteredDoctors.map(doctor => <DoctorCardIC key={doctor.name} {...doctor} />)
                    ) : (
                    <p>No doctors found.</p>
                    )}
                </center>
                ) : (
                <center>
                    <h2>Available Doctors</h2>
                    <h3>Book appointments with minimum wait-time & verified doctor details</h3>
                    <div style={{display:'flex', flexWrap:'wrap', justifyContent:'center'}}>
                        {doctors.map(doctor => <DoctorCardIC key={doctor.name} {...doctor} />)}
                    </div>
                </center>
                )}
            </div>
        </div>
        </center>
    )
}

export default InstantConsultation