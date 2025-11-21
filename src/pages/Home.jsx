import React from 'react';
import Hero from '../components/sections/Hero';
import LatestSermons from '../components/sections/LatestSermons';
import About from '../components/sections/About';
import Worship from '../components/sections/Worship';
import Location from '../components/sections/Location';
import Offering from '../components/sections/Offering';

const Home = () => {
    return (
        <main>
            <Hero />
            <LatestSermons />
            <About />
            <Worship />
            <Location />
            <Offering />
        </main>
    );
};

export default Home;
