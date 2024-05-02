import React from 'react';

const WeightSVG = (props) => {
    return (
        <svg width="0" height="0" className="hidden">
            <symbol id="weight-light" viewBox="0 0 512 512">
                <path d="M374.497,40.175h-37.342C318.466,15.77,289.042,0,255.999,0s-62.466,15.77-81.155,40.175h-37.341
                    c-59.497,0-107.901,48.404-107.901,107.9v216.559C29.601,445.892,95.71,512,176.968,512h158.064
                    c81.258,0,147.366-66.108,147.366-147.366V148.075C482.398,88.579,433.994,40.175,374.497,40.175z M255.999,20.398
                    c45.093,0,81.778,36.686,81.778,81.778s-36.686,81.777-81.778,81.777s-81.778-36.686-81.778-81.778S210.907,20.398,255.999,20.398
                    z M462.001,364.634H462c0,70.011-56.958,126.968-126.968,126.968H176.968C106.957,491.602,50,434.644,50,364.634V148.075
                    c0-48.249,39.254-87.502,87.503-87.502h25.182c-5.691,12.715-8.861,26.795-8.861,41.604c0,56.34,45.835,102.177,102.177,102.177
                    s102.177-45.835,102.177-102.177c0-14.808-3.17-28.888-8.861-41.604h25.182c48.249,0,87.503,39.253,87.503,87.502V364.634z"></path>
                <path d="M255.999,33.657c-5.632,0-10.199,4.567-10.199,10.199v58.135c0,5.632,4.567,10.199,10.199,10.199
                    c5.632,0,10.199-4.567,10.199-10.199V43.857C266.199,38.225,261.632,33.657,255.999,33.657z"></path>
                <path d="M72.414,182.566c-5.632,0-10.199,4.567-10.199,10.199v149.928c0,5.632,4.567,10.199,10.199,10.199
                    c5.632,0,10.199-4.567,10.199-10.199V192.765C82.613,187.133,78.046,182.566,72.414,182.566z"></path>
                <path d="M72.414,139.729c-5.632,0-10.199,4.567-10.199,10.199v10.199c0,5.632,4.567,10.199,10.199,10.199
                    c5.632,0,10.199-4.567,10.199-10.199v-10.199C82.613,144.296,78.046,139.729,72.414,139.729z"></path>
                <text x="50%" y="55%" textAnchor="middle" dominantBaseline="middle" fill={props.fillColor} fontSize={props.fontSize}>
                    {props.children}
                </text>
                <text x="50%" y="70%" textAnchor="middle" dominantBaseline="middle" fill={props.fillColor} fontSize={props.fontSize}>
                    {props.composition.weight} kg
                </text>
            </symbol>
        </svg>
    );
};

export default WeightSVG;
