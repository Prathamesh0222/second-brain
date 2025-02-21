import { GithubIcon } from "../icons/GithubIcon";
import { LinkedinIcon } from "../icons/LinkedinIcon";

export const Footer = () => {
  return (
    <div className="max-w-7xl mx-auto flex justify-between px-4 items-center border-gray-500">
      <p className="text-gray-400 mb-4 md:mb-0">
        Designed & Developed by Prathamesh
      </p>
      <div className="flex gap-2">
        <GithubIcon
          onClick={() =>
            (window.location.href = "https://github.com/Prathamesh0222")
          }
        />
        <LinkedinIcon
          onClick={() =>
            (window.location.href =
              "https://www.linkedin.com/in/prathamesh-pimpalkar-903b0621a/")
          }
        />
      </div>
    </div>
  );
};
