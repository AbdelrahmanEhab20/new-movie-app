import React from 'react'

function Search() {
    return (
        <div className="search">
            <div>
                <img src="./searchIcon.png" alt="Search Icon" />
                <input type="text" placeholder="Search Movies..." />
            </div>
        </div>
    )
}

export default Search