import { Card, CardBody, CardHeader, Typography } from "@material-tailwind/react"
import TableHead from "../table/tableHead"
import { Member } from "../../../types/admin.interface";
import { useEffect, useState } from "react";
import FormInput from "../login";
import Spinner from "./spinner";
import authenticatedAxios from "../../../services/request.service";
import PlusCircleIcon from "@heroicons/react/24/solid/PlusCircleIcon";
import AddMemberModal from "../../widget/cards/addMemberModal";

interface MembersProps {
  memberCount: number
  setMemberCount: React.Dispatch<React.SetStateAction<number>>;
}

const Members: React.FC<MembersProps> = ({
  memberCount,
  setMemberCount }) => {

  const getNotes = (members: Member[]) => {
    const notes = members.map((member) => {
      return member.note;
    });

    return notes;
  }

  const [ready, setReady] = useState<boolean>(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [notes, setNote] = useState<(number | null | undefined | string)[]>(getNotes(members));
  const [showModal, setShowModal] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [affiliation, setAffiliation] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await authenticatedAxios.post("members", {
        name,
        affiliation,
      });

      if (response.status === 201) {
        const newMember = response.data;
        members.push(newMember);
        window.alert("추가 성공");
        setName("");
        setAffiliation("");
        setMembers(members);
        setMemberCount(++memberCount);
        setShowModal(false);
      }
    }
    catch (error) {
      window.alert("오류가 발생했습니다. 다시 시도하세요.");
    }
  }

  useEffect(() => {
    console.log("mem")
    const fetchData = async () => {
      try {
        const response = await authenticatedAxios.get<Member[]>("/members");

        if (response.status === 200) {
          const memberData = response.data; // 데이터를 MemberData 타입 배열로 변환

          const notes = getNotes(memberData);

          setReady(true);
          setMemberCount([...memberData].length);
          setMembers([...memberData]);
          setNote(notes);
        }
      } catch (error) {

      }
    };

    fetchData();
  }, []);

  const tdTextContent = "font-medium text-blue-gray-600 text-center";

  const shadow = (notes: (string | number | null | undefined)[]) => {
    const shadow = [...notes].map((note) => {
      if (!note || note === null) {
        return "일반 회원";
      }
      return note;
    })
    return shadow;
  }

  const getNewMembers = (members: Member[], id: number) => {
    const newMember = members.filter((member) => member.id !== id);
    return newMember;
  }

  const getAutortity = (authorityData: number | null) => {
    if (authorityData === 0 || authorityData === 1) {
      return "0"
    }
    return "X"
  }

  // 직위 변경
  const positionChange = async (id: number, note: any, setMembers: React.Dispatch<React.SetStateAction<Member[]>>) => {
    try {
      const response = await authenticatedAxios.put("/members", {
        id,
        note
      });

      if (response.status === 201) {
        const newMembersInfo: Member[] = response.data;
        setMembers(newMembersInfo);
        window.alert("수정 완료");
        setReady(true);
        return;
      }

      window.alert("문제가 발생했습니다. 다시 시도하세요.");
      return;

    } catch (error) {
      window.alert("문제가 발생했습니다. 다시 시도하세요.");
      return;
    }
  }

  // 회원 삭제
  const deleteMember = async (id: number, members: Member[], setMembers: React.Dispatch<React.SetStateAction<Member[]>>, setNote: React.Dispatch<React.SetStateAction<(number | null | undefined | string)[]>>) => {
    try {
      const flag = window.confirm("회원을 탈퇴시키겠습니까?");

      if (!flag) return;

      const response = await authenticatedAxios.delete(`/members/${id}`);

      if (response.status === 204) {
        const newMembers = getNewMembers(members, id);
        setMembers(newMembers);
        setMemberCount(--memberCount)
        const notes = newMembers.map((member) => {
          return member.note;
        });
        setNote(notes);
        window.alert("탈퇴 완료");
        return;
      }

      window.alert("문제가 발생했습니다. 다시 시도하세요.");
      return;

    } catch (error) {
      window.alert("문제가 발생했습니다. 다시 시도하세요.");
      return;
    }
  }

  return (
    <div className="relative">
      <Spinner flag={ready} />
      <div className={`${ready ? "" : "opacity-0"} transition-opacity`}>
        <Card
          className="border-2 border-slate-100 rounded-lg">
          <CardHeader
            floated={false}
            shadow={false}
            color="transparent"
            className="m-0 flex items-center justify-between p-6"
          >
            <Typography variant="h6" color="blue-gray" className="mb-1">
              포럼 회원 정보
            </Typography>
            <div className="absolute mb-1 right-6">
              <PlusCircleIcon
                className="font-medium w-10 cursor-pointer"
                type="button"
                onClick={() => setShowModal(true)}
              />
            </div>
          </CardHeader>
          <CardBody className="overflow-y-scroll px-0 pt-0 pb-2">
            <table className="w-full min-w-[840px] table-auto">
              <TableHead topics={["사이트 가입 여부", "email", "id", "이름", "소속", "포럼 직위", "회원 관리"]} px="px-8" />
              <tbody>
                {members.map(
                  ({ id, email, name, affiliation, authority }, key) => {
                    const className = `py-3 px-1 ${key === members.length - 1
                      ? ""
                      : "border-b border-blue-gray-50"
                      }`;

                    return (
                      <tr
                        key={key}
                        className="transition-shadow hover:shadow-inner"
                      >
                        <td className={className}>
                          <Typography
                            variant="small"
                            className={tdTextContent}
                          >
                            {getAutortity(authority)}
                          </Typography>
                        </td>
                        <td className={className}>
                          <Typography
                            variant="small"
                            className={tdTextContent}
                          >
                            {email ? email : "X"}
                          </Typography>
                        </td>
                        <td className={className}>
                          <Typography
                            variant="small"
                            className={tdTextContent}
                          >
                            {id}
                          </Typography>
                        </td>
                        <td className={className}>
                          <Typography
                            variant="small"
                            className={tdTextContent}
                          >
                            {name}
                          </Typography>
                        </td>
                        <td className={className}>
                          <Typography
                            variant="small"
                            className={tdTextContent}
                          >
                            {affiliation ? affiliation : "불러오지 못했습니다.."}
                          </Typography>
                        </td>
                        <td className={`${className} `}>
                          <div className="flex justify-center">
                            <FormInput
                              id="name"
                              label={""}
                              type="text"
                              autoComplete="name"
                              placeholder={"회원의 직위를 입력하세요."}
                              value={`${[notes][key] === null ? "일반 회원" : shadow(notes)[key]}`}
                              width={"w-24"}
                              margin="m-0"
                              onChange={(e) => {
                                const _note = [...notes];
                                _note[key] = e.target.value;
                                setNote(_note);
                              }}
                            />
                          </div>
                        </td>
                        <td className={`${className} flex justify-center space-x-2 h-full py-3`}>
                          <button
                            className={"w-15 bg-slate-600 text-white font-bold uppercase text-sm px-1 py-1 rounded shadow hover:shadow-lg my-1"}
                            onClick={async () => positionChange(id, notes[key], setMembers)}
                          >
                            직위 변경
                          </button>
                          <button
                            className={"w-15 bg-red-500 text-white font-bold uppercase text-sm px-1 py-1 rounded shadow hover:shadow-lg my-1"}
                            onClick={async () => deleteMember(id, members, setMembers, setNote)}
                          >
                            포럼 탈퇴
                          </button>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </CardBody>
        </Card>
      </div>
      <AddMemberModal
        showModal={showModal}
        setShowModal={setShowModal}
        name={name}
        affiliation={affiliation}
        setName={setName}
        setAffiliation={setAffiliation}
        handleSubmit={handleSubmit}
      />
    </div>
  )
}

export default Members;