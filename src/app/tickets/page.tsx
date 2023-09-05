

export default function Home() {
    return (
        <div>


            <h1 className="text-4xl font-semibold text-center my-5 text-[#237a39]">
                My Tickets
            </h1>

            <div className="flex flex-wrap justify-center">

                <div className="card rounded-lg w-full p-4 m-2 bg-base-100 shadow-xl hover:shadow-2xl transition duration-300 ease-in-out sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/4">
                    <figure>
                        <img className="w-full h-48 object-cover rounded-t-lg" src="/capibara.png" alt="Shoes" />
                    </figure>
                    <div className="card-body p-4">
                        <h2 className="card-title text-2xl font-semibold mb-2">Saturday morning in the woods</h2>
                        <p className="text-base text-gray-700">Seeking a break from the hustle and bustle? Join us for a serene painting session in the woods this Saturday morning! Embrace the tranquility as you capture the beauty of dappled sunlight, ancient trees, and wildlife on canvas.</p>
                        <div className="card-actions flex justify-between mt-5 items-center">
                            <div className="text-[#237a39] font-semibold text-lg">23 BGN</div>
                            <button className="btn btn-primary bg-[#237a39] border-none hover:bg-[#237a39db] text-[#edf2ef] rounded py-2 px-4 transition duration-300 ease-in-out">
                                View Ticket
                            </button>
                        </div>
                    </div>
                </div>




            </div>
        </div>
    );
}
