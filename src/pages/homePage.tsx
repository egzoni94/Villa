import { useEffect, useState } from "react";
import { handleGet } from "../utilities/handleApiCalls";
import { useTheme } from "../utilities/theme";
import { FormControlLabel, Switch, Card } from "@mui/material";
import { House } from "lucide-react";
import ModalFormMain from "../utilities/modalFormMain";
import { Colors } from "../utilities/colors";

export function HomePage() {
  type Room = {
    roomNo: string;
    roomType: string;
    roomMovementId: number;
    roomModel: string;
    roomModelDescription: string;
    roomTypeDescription: string;
    title: string;
    isOpen: boolean;
    isExtraRoomType: boolean;
    minuteLeft: number;
    enteredOn?: string;
    orderNo?: number;
    clientPlateNo?: string;
    clientDocument?: string;
    clientCarName?: string;
    startTime?: string;
    spendTime?: string;
    amountDebt?: number;
    isDebt: boolean;
    hours?: number;
    price?: number;
  };

  const [allRoams, setAllRoams] = useState<Room[]>([]);
  const { toggleTheme, theme } = useTheme(); // theme is now typed as 'light' | 'dark'
  const [isModalOpen, setIsModalOpen] = useState({ type: "" }); // State to control modal visibility
  const [roomTypes, setRoomTypes] = useState<
    { value: string; label: string }[]
  >([]);
  const defaultRoom: Room = {
    roomNo: "",
    roomType: "",
    roomMovementId: 0,
    roomModel: "",
    roomModelDescription: "",
    roomTypeDescription: "",
    title: "",
    isOpen: false,
    isExtraRoomType: false,
    minuteLeft: 0,
    enteredOn: "",
    orderNo: 0,
    clientPlateNo: "",
    clientDocument: "",
    clientCarName: "",
    startTime: "",
    spendTime: "",
    amountDebt: 0,
    isDebt: false,
    hours: 0,
    price: 0,
  };

  type RoomModel = {
    code: string;
    description: string;
  };

  const [selectedRoom, setSelectedRoom] = useState<Room>(defaultRoom); // Always a Room object

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await handleGet("api/Room/GetRooms");
        console.log(response, "response");
        if (response.isSuccessfull) {
          setAllRoams(response?.data as Room[]);
        }

        const roomTypesResponse = await handleGet("api/RoomModel/GetAll");
        if (roomTypesResponse.isSuccessfull) {
          const roomTypes: RoomModel[] = roomTypesResponse.data; // Explicitly define type for roomTypes
          setRoomTypes(
            roomTypes.map((room: RoomModel) => ({
              value: room.code,
              label: room.description,
            }))
          );
        }
      } catch (err) {
        console.error("Error fetching rooms:", err);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const handleRoomClick = () => {
    console.log("hereee");
    // setSelectedRoom(room); // Set the selected room
    setIsModalOpen({ type: "new" }); // Open the modal
  };

  const handleCloseModal = () => {
    setIsModalOpen({ type: "" }); // Close the modal
  };

  const handleDetailRoom = (item: Room) => {
    console.log(item);
    setIsModalOpen({ type: "details" });
  };

  const handleExtraDetailsRoom = (item: Room) => {
    console.log(item);
    setIsModalOpen({ type: "extraDetails" });
  };

  const fieldConfig = [
    {
      type: "text" as const,
      label: "Dokument",
      props: {
        value: selectedRoom?.clientDocument || "", // Fallback to an empty string if null
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
          if (selectedRoom) {
            setSelectedRoom((prevDetails) => ({
              ...prevDetails,
              clientDocument: e.target.value,
            }));
          }
        },
        variant: "outlined",
        fullWidth: true,
        margin: "normal",
      },
    },
    {
      type: "text" as const,
      label: "Vetura",
      props: {
        value: selectedRoom?.clientCarName || "", // Fallback to an empty string if null
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
          if (selectedRoom) {
            setSelectedRoom((prevDetails) => ({
              ...prevDetails,
              clientCarName: e.target.value,
            }));
          }
        },
        variant: "outlined",
        fullWidth: true,
        margin: "normal",
      },
    },
    {
      type: "text" as const,
      label: "Tabela",
      props: {
        value: selectedRoom?.clientPlateNo || "", // Fallback to an empty string if null
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
          if (selectedRoom) {
            setSelectedRoom((prevDetails) => ({
              ...prevDetails,
              clientPlateNo: e.target.value,
            }));
          }
        },
        variant: "outlined",
        fullWidth: true,
        margin: "normal",
      },
    },
    {
      type: "select" as const,
      label: "Lloji dhomes",
      options: roomTypes, // Directly pass the roomTypes (already in { value: string, label: string } format)
      props: {
        value: selectedRoom?.roomType || "", // default value
        onChange: (e: React.ChangeEvent<{ value: unknown }>) => {
          setSelectedRoom((prevDetails) => ({
            ...prevDetails,
            roomType: e.target.value as string, // Assuming roomType is string
          }));
        },
        variant: "outlined",
        fullWidth: true,
        margin: "normal",
      },
    },
    {
      type: "text" as const,
      label: "Ore",
      props: {
        value: selectedRoom?.hours || "", // Fallback to an empty string if null
        // onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        //   if (selectedRoom) {
        //     setSelectedRoom((prevDetails) => ({
        //       ...prevDetails,
        //       clientPlateNo: e.target.value,
        //     }));
        //   }
        // },
        variant: "outlined",
        fullWidth: true,
        margin: "normal",
      },
    },
    {
      type: "text" as const,
      label: "Qmimi",
      options: roomTypes,
      props: {
        value: selectedRoom?.price || "", // default value
        // onChange: (e: React.ChangeEvent<{ value: unknown }>) => {
        //   setSelectedRoom((prevDetails) => ({
        //     ...prevDetails,
        //     isDebt: !selectedRoom?.isDebt, // Assuming roomType is string
        //   }));
        // },
        variant: "outlined",
        fullWidth: true,
        margin: "normal",
      },
    },
    {
      type: "checkbox" as const,
      label: "Pagoi",
      options: roomTypes,
      props: {
        value: selectedRoom?.isDebt || "", // default value
        onChange: (e: React.ChangeEvent<{ value: unknown }>) => {
          setSelectedRoom((prevDetails) => ({
            ...prevDetails,
            isDebt: !selectedRoom?.isDebt, // Assuming roomType is string
          }));
        },
        variant: "outlined",
        fullWidth: true,
        margin: "normal",
      },
    },
    {
      type: "button" as const,
      label: "Hap",
      props: {
        variant: "contained",
        color: "primary",
        onClick: () => {
          console.log("Form submitted");
          handleCloseModal(); // Close the modal after submission
        },
      },
    },
  ];

  return (
    <div className="main_container">
      <div className="dark_theme_container">
        <FormControlLabel
          control={<Switch checked={theme === "dark"} onChange={toggleTheme} />}
          label={theme === "light" ? "Switch to Dark" : "Switch to Light"}
        />
      </div>

      <div
        className="rooms_container"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "20px",
          // overflow: "hidden",
        }}
      >
        {allRoams?.length > 0 ? (
          allRoams.map((item) => (
            <div
              key={item.roomNo}
              style={{
                flexShrink: "1",
                boxSizing: "border-box",
                height: "140px",
                cursor: "pointer",
                position: "relative",
                marginBottom: "15px",
              }}
            >
              <p
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "14px",
                }}
                // color:{theme === "dark" ?  "#000" : "#fff"}}
              >
                {item?.title}
              </p>
              <Card
                sx={{
                  width: "120px",
                  boxShadow: "none",
                }}
              >
                <House
                  width={120}
                  height={140}
                  style={{
                    fill: item?.isOpen
                      ? Colors(theme).houseBusyFill
                      : item?.isExtraRoomType
                      ? Colors(theme).houseExtraFillColor
                      : Colors(theme).houseFreeFill,
                    background: theme === "dark" ? "#121212" : "#fff",
                  }}
                  // onClick={() => handleRoomClick(item)} // Trigger room click
                  onClick={() => {
                    if (!item?.isOpen) {
                      handleRoomClick(); // Action for when the item is not open
                    } else if (item?.isOpen) {
                      handleDetailRoom(item); // Action for when the item is open
                    } else {
                      handleExtraDetailsRoom(item); // Default action
                    }
                  }}
                />
              </Card>
            </div>
          ))
        ) : (
          <>Loading...</>
        )}
      </div>

      {/* {isModalOpen?.type && selectedRoom && (
        <ModalFormMain
          fieldConfig={fieldConfig}
          onSubmit={() => {
            handleCloseModal();
          }}
          onClose={() => {
            setIsModalOpen({ type: "" });
          }}
          zIndex={10}
          theme={theme}
        />
      )} */}
      {isModalOpen?.type === "new" && (
        <ModalFormMain
          fieldConfig={fieldConfig}
          onSubmit={() => {
            handleCloseModal();
          }}
          onClose={() => {
            setIsModalOpen({ type: "" });
          }}
          zIndex={10}
          theme={theme}
        />
      )}
    </div>
  );
}
