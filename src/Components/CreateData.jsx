import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  faCheck,
  faTimes,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { useFakeAuth } from "../Redux/FakeAuthProvider";

const NAME_REGEX = /^([a-zA-ZùÙüÜäàáëèéïìíöòóüùúÄÀÁËÈÉÏÌÍÖÒÓÜÚñÑ\s]+)$/;
const ADDRESS_REGEX = /([a-z ]{2,}\s{0,1})(\d{0,3})(\s{0,1}\S{2,})?/i;

const CreateData = forwardRef((props, ref) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {},
  });
  const userRef = useRef();

  const [name, setName] = useState("");
  const [validName, setValidName] = useState(false);

  useEffect(() => {
    if (type === "name" || type === "lastName") {
      setValidName(NAME_REGEX.test(name));
    } else {
      setValidName(ADDRESS_REGEX.test(name));
    }
  }, [name]);

  const notify = () =>
    toast.success(`Información agregada correctamente :)`, {
      icon: false,
      toastId: "success",
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });
  const errorNotify = () =>
    toast.error(
      "Ha ocurrido un error al agregar la información, verifica que el dato es correcto e intente de nuevo",
      {
        icon: false,
        toastId: "error",
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      }
    );
  const { user } = useFakeAuth();
  const [visible, setVisible] = useState(false);
  const [type, setType] = useState("");
  const [countries, setCountries] = useState(null);
  const [countrySelected, setCountrySelected] = useState(null);
  const [myData, setMyData] = useState({
    id: "",
    name: "",
    lastName: "",
    city: "",
    country: "",
    phoneNumber: "",
    address: "",
  });

  useEffect(() => {
    const getCountries = async () => {
      const res = await axios.get(
        "https://countriesnow.space/api/v0.1/countries/"
      );
      setCountries(res.data.data);
    };
    getCountries();
  }, []);

  useEffect(() => {
    const getData = async () => {
      const res = await axios.get(`/user/getUser?id=${user?.sub}`);
      setMyData({
        ...myData,
        id: user?.sub,
        name: res.data.name,
        lastName: res.data.lastName,
        city: res.data.city,
        country: res.data.country,
        phoneNumber: res.data.phoneNumber,
        address: res.data.address,
        email: res.data.email,
        picture: res.data.picture,
        birthdate: res.data.birthdate,
      });
    };
    if (user?.sub) {
      getData();
    }
  }, [user?.sub, type]);

  useEffect(() => {
    if (visible !== false && type === "") {
      if (visible === "nombre") {
        setType("name");
      } else if (visible === "apellido") {
        setType("lastName");
      } else if (visible === "número de celular") {
        setType("tel");
      } else if (visible === "pais y ciudad") {
        setType("pais y ciudad");
      } else if (visible === "domicilio") {
        setType("address");
      }
    } else return;
  }, [visible, type]);

  useImperativeHandle(ref, () => {
    return {
      TogglePopUp,
      visible,
    };
  });
  const TogglePopUp = async (type) => {
    await setName("");
    if (type === "created") {
      await setType("");
      await setMyData("");
      await setVisible(false);
      props.create();
    } else {
      setVisible(type);
      setType("");
      setMyData("");
    }
  };
  const handleCountry = (event) => {
    setCountrySelected(event.target.value);
    setMyData({
      ...myData,
      country: event.target.value,
    });
  };
  const cities = countrySelected
    ? countries.find((country) => country.country === countrySelected).cities
    : [];
  const handlerChange = (event) => {
    if (typeof event === "string" || event === undefined) {
      setMyData({
        ...myData,
        phoneNumber: event,
      });
      return;
    } else {
      setName(event.target.value);
      setMyData({
        ...myData,
        [event.target.name]: event.target.value,
      });
      return;
    }
  };
  const handlerCreate = async () => {
    if (type === "name" || type === "lastName") {
      if (!NAME_REGEX.test(name)) {
        errorHandler();
      } else {
        try {
          await axios.put("/user/updateUser", myData);
          notify();
          TogglePopUp("created");
        } catch (error) {
          errorHandler(error);
        }
      }
    } else if (type === "address") {
      if (!ADDRESS_REGEX.test(name)) {
        errorHandler();
      } else {
        try {
          await axios.put("/user/updateUser", myData);
          notify();
          TogglePopUp("created");
        } catch (error) {
          errorHandler(error);
        }
      }
    } else {
      if (
        (myData.phoneNumber === "none" ||
          myData.phoneNumber === undefined ||
          myData.phoneNumber === props.phoneNumber) &&
        (myData.city === "none" ||
          myData.city === undefined ||
          myData.city === props.city)
      ) {
        errorHandler();
      } else {
        try {
          await axios.put("/user/updateUser", myData);
          notify();
          TogglePopUp("created");
        } catch (error) {
          errorHandler(error);
        }
      }
    }
  };
  const errorHandler = async () => {
    await TogglePopUp("created");
    errorNotify();
  };

  return (
    <>
      {visible !== false ? (
        <section className=" fixed z-10 inset-0 flex justify-center items-center bg-[#000000ab] ">
          <div className="w-7/12 bg-white h-1/2 rounded-lg flex flex-col items-center justify-evenly">
            <h3 className="text-black text-2xl mx-auto text-center font-light">
              Introduce tu {visible} y presiona en "Agregar"
            </h3>

            {type && type === "tel" ? (
              <PhoneInput
                autocomplete="off"
                name="phoneNumber"
                onChange={handlerChange}
                className="w-1/2"
                placeholder="Ingresa tu numero de telefono"
              />
            ) : (
              <>
                {type && type === "pais y ciudad" ? (
                  <>
                    <select
                      className="m-2 bg-white border  text-neutral-900 py-2 px-4 rounded-sm w-1/2 placeholder:font-light border-neutral-900 focus:border-neutral-900"
                      onChange={handleCountry}
                      name="country"
                    >
                      <option value="" selected disabled="true">
                        Pais
                      </option>
                      {countries.map((country) => {
                        return (
                          <option value={country.country}>
                            {country.country}
                          </option>
                        );
                      })}
                    </select>
                    <select
                      onChange={handlerChange}
                      className="m-2 bg-white border  text-neutral-900 py-2 px-4 rounded-sm w-1/2 placeholder:font-light  border-neutral-900 focus:border-neutral-900"
                      name="city"
                      disabled={countrySelected !== null ? false : true}
                    >
                      <option value="Ciudad" selected disabled="true">
                        Ciudad
                      </option>
                      {cities !== [] &&
                        cities.map((city) => {
                          return <option value={city}>{city}</option>;
                        })}
                    </select>
                  </>
                ) : (
                  <div className="flex w-full items-center justify-center ">
                    <input
                      {...register(type, { required: true })}
                      autocomplete="off"
                      name={type}
                      ref={userRef}
                      value={name}
                      required
                      aria-invalid={validName ? "false" : "true"}
                      aria-describedby="uidnote"
                      type="text"
                      onChange={handlerChange}
                      placeholder={`Ingresa tu ${visible}`}
                      className="m-2 bg-white border  text-neutral-900 py-2 px-4 rounded-sm w-1/2 placeholder:font-light border-neutral-900 focus:border-neutral-900"
                    />
                  </div>
                )}
              </>
            )}
            <div className="flex justify-evenly w-full">
              <button
                onClick={handlerCreate}
                className="bg-white text-black border border-neutral-900 font-normal px-3 py-1 rounded-sm text-lg"
              >
                Agregar
              </button>
              <button
                onClick={() => TogglePopUp(false)}
                className="bg-black text-white border border-neutral-900 font-normal px-3 py-1 rounded-sm text-lg"
              >
                Cancelar
              </button>
            </div>
          </div>
        </section>
      ) : (
        <></>
      )}
    </>
  );
});
export default CreateData;
